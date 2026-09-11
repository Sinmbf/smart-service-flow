import { prisma } from "../../db.js";

const DEFAULT_INTERVAL_MS = 10_000;
const DEFAULT_APPROACH_MINUTES = 10;
let handle = null;
let processing = false;

function envNumber(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function createNotification(tx, { token, type, counterName, stage, minutes }) {
  const approaching = type === "TURN_APPROACHING";
  const nepali = token.user?.preferredLanguage === "NE";
  const grace = envNumber("NO_SHOW_MINUTES", 3);
  const place = counterName || stage.location || (nepali ? "सेवा काउन्टर" : "service counter");

  await tx.notification.create({
    data: {
      userId: token.userId,
      type,
      titleEn: approaching ? "Your turn is approaching" : "Your turn has come",
      titleNe: approaching ? "तपाईंको पालो आउँदैछ" : "तपाईंको पालो आएको छ",
      messageEn: approaching
        ? `Your turn is about ${minutes} minutes away. Please be ready to proceed to ${place}.`
        : `Your turn has come. Please proceed to ${place} within the next ${grace} minutes.`,
      messageNe: approaching
        ? `तपाईंको पालो करिब ${minutes} मिनेटमा आउँछ। ${place} मा जान तयार रहनुहोस्।`
        : `तपाईंको पालो आएको छ। कृपया ${grace} मिनेटभित्र ${place} मा जानुहोस्।`,
    },
  });
}

export async function processQueueAutomation({ now = new Date() } = {}) {
  if (processing) return;
  processing = true;
  try {
    const approachMinutes = envNumber("TURN_APPROACHING_MINUTES", DEFAULT_APPROACH_MINUTES);
    const stages = await prisma.serviceStage.findMany({
      where: { tokens: { some: { status: { in: ["WAITING", "CALLED", "CHECKED_IN", "SERVING"] } } } },
      select: {
        id: true,
        serviceId: true,
        baselineMinutes: true,
        location: true,
        counters: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, currentTokenId: true },
        },
      },
    });

    for (const stage of stages) {
      const capacity = stage.counters.length;
      if (capacity < 1) continue;

      // Reconcile orphaned/duplicate CALLED rows. At most one CALLED/CHECKED_IN/SERVING
      // token is allowed per active physical counter, so the total active load cannot
      // exceed the number of active counters.
      const called = await prisma.token.findMany({
        where: { currentStageId: stage.id, status: "CALLED" },
        orderBy: [{ calledAt: "asc" }, { stageEnteredAt: "asc" }, { generatedAt: "asc" }, { id: "asc" }],
        select: { id: true, calledAt: true },
      });
      if (called.length > capacity) {
        const duplicateIds = called.slice(capacity).map((t) => t.id);
        await prisma.$transaction(async (tx) => {
          await tx.token.updateMany({
            where: { id: { in: duplicateIds }, status: "CALLED" },
            data: { status: "WAITING", calledAt: null, turnApproachingNotifiedAt: null },
          });
          await tx.counter.updateMany({
            where: { currentTokenId: { in: duplicateIds } },
            data: { currentTokenId: null },
          });
          for (const id of duplicateIds) {
            await tx.auditLog.create({
              data: {
                action: "TOKEN_CALL_RECONCILED",
                target: id,
                metadata: { stageId: stage.id, reason: "active_calls_exceeded_counter_capacity" },
              },
            });
          }
        });
      }

      const active = await prisma.token.count({
        where: { currentStageId: stage.id, status: { in: ["CALLED", "CHECKED_IN", "SERVING"] } },
      });

      const busySlots = Math.min(active, capacity);
      const freeSlots = Math.max(0, capacity - busySlots);

      const waiting = await prisma.token.findMany({
        where: { currentStageId: stage.id, status: "WAITING" },
        orderBy: [{ stageEnteredAt: "asc" }, { generatedAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          tokenNumber: true,
          userId: true,
          position: true,
          turnApproachingNotifiedAt: true,
          user: { select: { id: true, preferredLanguage: true } },
        },
      });
      if (!waiting.length) continue;

      const baseline = Math.max(1, stage.baselineMinutes || 10);

      // Notify waiting citizens about their approximate time to call.
      for (let i = 0; i < waiting.length; i += 1) {
        const token = waiting[i];
        const estimated = Math.max(0, Math.ceil((active + i) / capacity) * baseline);
        if (!token.turnApproachingNotifiedAt && estimated > 0 && estimated <= approachMinutes) {
          await prisma.$transaction(async (tx) => {
            const current = await tx.token.findUnique({
              where: { id: token.id },
              select: { status: true, turnApproachingNotifiedAt: true, userId: true },
            });
            if (!current || current.status !== "WAITING" || current.turnApproachingNotifiedAt) return;
            await tx.token.update({ where: { id: token.id }, data: { turnApproachingNotifiedAt: now } });
            await createNotification(tx, {
              token: { ...token, userId: current.userId },
              type: "TURN_APPROACHING",
              stage,
              minutes: Math.max(1, estimated),
            });
            await tx.auditLog.create({
              data: {
                action: "TURN_APPROACHING_NOTIFIED",
                target: token.id,
                metadata: { estimatedWaitMinutes: estimated, stageId: stage.id },
              },
            });
          });
        }
      }

      if (freeSlots <= 0) continue;

      // Fill every currently-free counter, one token per counter.
      const sortedFreeCounters = stage.counters.filter((c) => !c.currentTokenId).slice(0, freeSlots);
      for (let i = 0; i < sortedFreeCounters.length && i < waiting.length; i += 1) {
        const candidate = waiting[i];
        const counter = sortedFreeCounters[i];

        await prisma.$transaction(async (tx) => {
          const current = await tx.token.findUnique({
            where: { id: candidate.id },
            include: { user: { select: { id: true, preferredLanguage: true } } },
          });
          if (!current || current.status !== "WAITING") return;

          const activeNow = await tx.token.count({
            where: { currentStageId: stage.id, status: { in: ["CALLED", "CHECKED_IN", "SERVING"] } },
          });
          if (activeNow >= capacity) return;

          const free = await tx.counter.findFirst({
            where: { id: counter.id, isActive: true, currentTokenId: null },
          });
          if (!free) return;

          await tx.token.update({ where: { id: current.id }, data: { status: "CALLED", calledAt: now } });
          await tx.counter.update({ where: { id: free.id }, data: { currentTokenId: current.id } });
          await createNotification(tx, {
            token: current,
            type: "TOKEN_CALLED",
            counterName: free.name,
            stage,
            minutes: 0,
          });
          await tx.auditLog.create({
            data: {
              action: "TOKEN_CALLED",
              target: current.id,
              metadata: { stageId: stage.id, counterId: free.id, counterName: free.name },
            },
          });
        });
      }
    }
  } finally {
    processing = false;
  }
}

export function startQueueAutomation() {
  if (handle) return;
  processQueueAutomation().catch((err) => console.error("[queue/autoCall] initial run failed:", err));
  const interval = envNumber("QUEUE_AUTOMATION_INTERVAL_MS", DEFAULT_INTERVAL_MS);
  handle = setInterval(() => {
    processQueueAutomation().catch((err) => console.error("[queue/autoCall] run failed:", err));
  }, interval);
  handle.unref?.();
  console.log(`[queue/autoCall] started (interval ${interval}ms)`);
}

export function stopQueueAutomation() {
  if (handle) {
    clearInterval(handle);
    handle = null;
  }
}
