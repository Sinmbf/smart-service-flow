// No-show sweeper: only CALLED tokens can expire after the grace period.
import { prisma } from "../../db.js";

const DEFAULT_INTERVAL_MS = 30_000;
let handle = null;
let intervalMs = DEFAULT_INTERVAL_MS;

function setIntervalMs(value) { intervalMs = value; }
function getIntervalMs() { return intervalMs; }

async function sweepNoShows({ now = new Date() } = {}) {
  const minutes = Number(process.env.NO_SHOW_MINUTES || 3);
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  const cutoff = new Date(now.getTime() - minutes * 60_000);
  try {
    const expired = await prisma.token.findMany({
      where: { status: "CALLED", calledAt: { lt: cutoff } },
      select: { id: true, tokenNumber: true },
    });
    let count = 0;
    for (const token of expired) {
      const changed = await prisma.$transaction(async (tx) => {
        const current = await tx.token.findUnique({ where: { id: token.id } });
        if (!current || current.status !== "CALLED") return false;
        await tx.token.update({ where: { id: token.id }, data: { status: "SKIPPED" } });
        await tx.counter.updateMany({ where: { currentTokenId: token.id }, data: { currentTokenId: null } });
        await tx.auditLog.create({
          data: {
            action: "TOKEN_NO_SHOW",
            target: token.id,
            metadata: { tokenNumber: token.tokenNumber, graceMinutes: minutes },
          },
        });
        return true;
      });
      if (changed) count += 1;
    }
    if (count > 0) console.log(`[queue/timeout] skipped ${count} called token(s) after ${minutes} minute grace`);
    return count;
  } catch (err) {
    console.error("[queue/timeout] sweep failed:", err);
    return 0;
  }
}

export function startNoShowSweeper() {
  if (handle) return;
  sweepNoShows();
  handle = setInterval(sweepNoShows, intervalMs);
  handle.unref?.();
  console.log(`[queue/timeout] started (interval ${intervalMs}ms)`);
}

export function stopNoShowSweeper() {
  if (handle) {
    clearInterval(handle);
    handle = null;
  }
}

export { setIntervalMs, getIntervalMs, sweepNoShows };
