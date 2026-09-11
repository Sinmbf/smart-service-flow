import { Router } from "express";
import { prisma } from "../../db.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/auth.js";

const router = Router();

const ACTIVE_STATUSES = ["WAITING", "CALLED", "CHECKED_IN", "SERVING"];
const MAX_RECALLS = 1;

/** Keep WAITING positions contiguous within one service stage.
 * Position is stage-local: when a token leaves a stage, the remaining
 * waiting tokens in that stage are re-numbered 1..N.
 */
async function normalizeWaitingPositions(tx, stageId) {
  const waiting = await tx.token.findMany({
    where: { currentStageId: stageId, status: "WAITING" },
    orderBy: [{ stageEnteredAt: "asc" }, { generatedAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  for (let i = 0; i < waiting.length; i += 1) {
    const position = i + 1;
    await tx.token.update({
      where: { id: waiting[i].id },
      data: { position },
    });
  }

  return waiting.length;
}

async function logAudit(tx, { actorId, action, target, metadata }) {
  try { await tx.auditLog.create({ data: { actorId, action, target, metadata } }); }
  catch (err) { console.error("[audit] failed to write audit log:", err); }
}

const TOKEN_RESPONSE_SELECT = {
  id: true,
  tokenNumber: true,
  status: true,
  position: true,
  currentStageId: true,
  generatedAt: true,
  calledAt: true,
  turnApproachingNotifiedAt: true,
  checkedInAt: true,
  serviceStartedAt: true,
  serviceCompletedAt: true,
  completedAt: true,
  user: { select: { id: true, name: true, phoneNumber: true } },
  currentStage: { select: { id: true, stageOrder: true, nameEn: true, nameNe: true, serviceId: true } },
};

async function resolveToken(identifier, req) {
  const normalized = identifier.trim();
  const include = {
    service: { select: { id: true, nameEn: true, nameNe: true } },
    user: { select: { id: true, name: true, phoneNumber: true, role: true, preferredLanguage: true } },
    currentStage: { select: { id: true, nameEn: true, nameNe: true, location: true } },
  };
  const officeFilter = req.user.role === "ADMIN" ? {} : { service: { officeId: req.user.officeId } };
  let token = await prisma.token.findFirst({ where: { id: normalized, ...officeFilter }, include });
  if (!token) token = await prisma.token.findFirst({ where: { tokenNumber: normalized, ...officeFilter }, include });
  if (!token) {
    const phone = normalized.replace(/\s/g, "");
    if (/^(\+977)?9[6-9]\d{8}$/.test(phone)) {
      const user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
      if (user) token = await prisma.token.findFirst({
        where: { userId: user.id, status: { in: ACTIVE_STATUSES }, ...officeFilter },
        orderBy: { generatedAt: "desc" }, include,
      });
    }
  }
  return token;
}

router.get("/search", requireAuth, requireRole("STAFF", "ADMIN"), async (req,res)=>{try{const q=typeof req.query.q==="string"?req.query.q.trim():"";if(!q)return res.json({success:true,tokens:[]});const where={tokenNumber:{contains:q,mode:"insensitive"},status:{in:ACTIVE_STATUSES},...(req.user.role==="ADMIN"?{}:{service:{officeId:req.user.officeId}})};const tokens=await prisma.token.findMany({where,take:20,orderBy:{generatedAt:"desc"},select:{id:true,tokenNumber:true,status:true,position:true,currentStage:{select:{id:true,nameEn:true,nameNe:true}},service:{select:{id:true,nameEn:true,nameNe:true,office:{select:{id:true,nameEn:true,nameNe:true}}}},user:{select:{name:true,phoneNumber:true}}}});res.json({success:true,tokens})}catch(e){console.error(e);res.status(500).json({success:false,message:"Failed to search tokens"})}});

/** Citizen has reached the assigned service counter. CALLED -> SERVING (check-in timestamp recorded). */
router.post("/check-in", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== "string") return res.status(400).json({ success: false, message: "identifier is required" });
    const token = await resolveToken(identifier, req);
    if (!token) return res.status(404).json({ success: false, message: "Token or citizen not found" });
    if (token.status !== "CALLED") {
      return res.status(400).json({ success: false, message: token.status === "WAITING" ? "Token has not been called yet" : token.status === "CHECKED_IN" ? "Token already checked in" : token.status === "SERVING" ? "Token already being served" : "Token is no longer active" });
    }
    const now = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.token.update({ where: { id: token.id }, data: { status: "SERVING", checkedInAt: now, serviceStartedAt: now }, select: TOKEN_RESPONSE_SELECT });
      await logAudit(tx, { actorId: req.user.id, action: "TOKEN_CHECKED_IN", target: token.id, metadata: { stageId: token.currentStageId } });
      await logAudit(tx, { actorId: req.user.id, action: "SERVICE_STARTED", target: token.id, metadata: { stageId: token.currentStageId, startedVia: "COUNTER_CHECK_IN" } });
      return result;
    });
    return res.status(200).json({ success: true, message: "Checked in and service started", token: updated });
  } catch (err) {
    console.error("[POST /api/staff/tokens/check-in] error:", err);
    return res.status(500).json({ success: false, message: "Failed to check in token" });
  }
});

/** CHECKED_IN -> SERVING. */
router.post("/:id/call", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res) => {
  try {
    const token = await prisma.token.findUnique({ where: { id: req.params.id } });
    if (!token) return res.status(404).json({ success: false, message: "Token not found" });
    if (req.user.role !== "ADMIN") { const svc = await prisma.service.findUnique({ where: { id: token.serviceId }, select: { officeId: true } }); if (!svc || svc.officeId !== req.user.officeId) return res.status(403).json({ success: false, message: "You cannot manage this government office queue" }); }
    if (token.status !== "CHECKED_IN") return res.status(400).json({ success: false, message: `Token must be CHECKED_IN to start service (currently ${token.status})` });
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.token.update({ where: { id: token.id }, data: { status: "SERVING", serviceStartedAt: new Date() }, select: TOKEN_RESPONSE_SELECT });
      await logAudit(tx, { actorId: req.user.id, action: "SERVICE_STARTED", target: token.id, metadata: { stageId: token.currentStageId } });
      return result;
    });
    return res.status(200).json({ success: true, message: "Service started", token: updated });
  } catch (err) {
    console.error("[POST /api/staff/tokens/:id/call] error:", err);
    return res.status(500).json({ success: false, message: "Failed to start service" });
  }
});

/** Staff/manual or sweeper skip after the CALLED grace period. */
router.post("/:id/skip", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res) => {
  try {
    const token = await prisma.token.findUnique({ where: { id: req.params.id } });
    if (!token) return res.status(404).json({ success: false, message: "Token not found" });
    if (req.user.role !== "ADMIN") { const svc = await prisma.service.findUnique({ where: { id: token.serviceId }, select: { officeId: true } }); if (!svc || svc.officeId !== req.user.officeId) return res.status(403).json({ success: false, message: "You cannot manage this government office queue" }); }
    if (token.status !== 'CALLED') return res.status(400).json({ success: false, message: `Token cannot be skipped from status ${token.status}` });
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.token.update({ where: { id: token.id }, data: { status: "SKIPPED" }, select: TOKEN_RESPONSE_SELECT });
      if (token.status === "CALLED") {
        await tx.counter.updateMany({ where: { currentTokenId: token.id }, data: { currentTokenId: null } });
      }
      await normalizeWaitingPositions(tx, token.currentStageId);
      await logAudit(tx, { actorId: req.user.id, action: "TOKEN_SKIPPED", target: token.id, metadata: { stageId: token.currentStageId, fromStatus: token.status } });
      return result;
    });
    return res.status(200).json({ success: true, message: "Token skipped", token: updated });
  } catch (err) {
    console.error("[POST /api/staff/tokens/:id/skip] error:", err);
    return res.status(500).json({ success: false, message: "Failed to skip token" });
  }
});

/** Recall a skipped token to the back of the current waiting queue. */
router.post("/:id/recall", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res) => {
  try {
    const token = await prisma.token.findUnique({ where: { id: req.params.id } });
    if (!token) return res.status(404).json({ success: false, message: "Token not found" });
    if (req.user.role !== "ADMIN") { const svc = await prisma.service.findUnique({ where: { id: token.serviceId }, select: { officeId: true } }); if (!svc || svc.officeId !== req.user.officeId) return res.status(403).json({ success: false, message: "You cannot manage this government office queue" }); }
    if (token.status !== "SKIPPED") return res.status(400).json({ success: false, message: `Only SKIPPED tokens can be recalled (currently ${token.status})` });

    // A citizen may generate a new token after a no-show. Once that happens,
    // the old skipped token must remain historical and must never be recalled,
    // otherwise the citizen could have two active queues for the same service.
    const replacementActiveToken = await prisma.token.findFirst({
      where: {
        userId: token.userId,
        serviceId: token.serviceId,
        status: { in: ACTIVE_STATUSES },
      },
      select: { id: true, tokenNumber: true, status: true },
      orderBy: { generatedAt: "desc" },
    });

    if (replacementActiveToken) {
      return res.status(409).json({
        success: false,
        code: "ACTIVE_REPLACEMENT_TOKEN_EXISTS",
        message: `This citizen already has an active token (${replacementActiveToken.tokenNumber}). The older skipped token cannot be recalled.`,
        activeToken: replacementActiveToken,
      });
    }

    const priorRecalls = await prisma.auditLog.count({ where: { action: "TOKEN_RECALLED", target: token.id } });
    if (priorRecalls >= MAX_RECALLS) return res.status(400).json({ success: false, code: "RECALL_LIMIT_REACHED", message: `This token has already been recalled ${priorRecalls} time(s); recall limit is ${MAX_RECALLS}.` });
    const updated = await prisma.$transaction(async (tx) => {
      const activeCount = await tx.token.count({ where: { currentStageId: token.currentStageId, status: { in: ACTIVE_STATUSES } } });
      const result = await tx.token.update({ where: { id: token.id }, data: { status: "WAITING", position: activeCount + 1, stageEnteredAt: new Date(), calledAt: null, turnApproachingNotifiedAt: null, checkedInAt: null, serviceStartedAt: null }, select: TOKEN_RESPONSE_SELECT });
      await normalizeWaitingPositions(tx, token.currentStageId);
      const normalized = await tx.token.findUnique({ where: { id: token.id }, select: TOKEN_RESPONSE_SELECT });
      await logAudit(tx, { actorId: req.user.id, action: "TOKEN_RECALLED", target: token.id, metadata: { stageId: token.currentStageId, newPosition: normalized?.position ?? result.position, recallNumber: priorRecalls + 1 } });
      return normalized || result;
    });
    return res.status(200).json({ success: true, message: "Token recalled", token: updated });
  } catch (err) {
    console.error("[POST /api/staff/tokens/:id/recall] error:", err);
    return res.status(500).json({ success: false, message: "Failed to recall token" });
  }
});

/** SERVING -> next stage WAITING, or final COMPLETED. */
router.post("/:id/complete", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res) => {
  try {
    const token = await prisma.token.findUnique({ where: { id: req.params.id }, include: { currentStage: true } });
    if (!token) return res.status(404).json({ success: false, message: "Token not found" });
    if (req.user.role !== "ADMIN") { const svc = await prisma.service.findUnique({ where: { id: token.serviceId }, select: { officeId: true } }); if (!svc || svc.officeId !== req.user.officeId) return res.status(403).json({ success: false, message: "You cannot manage this government office queue" }); }
    if (token.status !== "SERVING") return res.status(400).json({ success: false, message: `Token must be SERVING to complete (currently ${token.status})` });
    const now = new Date();
    const nextStage = await prisma.serviceStage.findFirst({ where: { serviceId: token.currentStage.serviceId, stageOrder: token.currentStage.stageOrder + 1 } });
    const updated = await prisma.$transaction(async (tx) => {
      if (token.serviceStartedAt) await tx.serviceDurationHistory.create({ data: { tokenId: token.id, serviceId: token.serviceId, stageId: token.currentStage.id, actualMinutes: (now.getTime()-token.serviceStartedAt.getTime())/60000, startedAt: token.serviceStartedAt, completedAt: now } });
      await tx.counter.updateMany({ where: { currentTokenId: token.id }, data: { currentTokenId: null } });
      let result;
      if (nextStage) {
        const activeCount = await tx.token.count({ where: { currentStageId: nextStage.id, status: { in: ACTIVE_STATUSES } } });
        result = await tx.token.update({ where: { id: token.id }, data: { currentStageId: nextStage.id, status: "WAITING", position: activeCount + 1, serviceCompletedAt: now, checkedInAt: null, serviceStartedAt: null, calledAt: null, turnApproachingNotifiedAt: null, stageEnteredAt: now }, select: TOKEN_RESPONSE_SELECT });
        await normalizeWaitingPositions(tx, token.currentStage.id);
        await normalizeWaitingPositions(tx, nextStage.id);
        result = await tx.token.findUnique({ where: { id: token.id }, select: TOKEN_RESPONSE_SELECT });
        await logAudit(tx, { actorId: req.user.id, action: "STAGE_COMPLETED", target: token.id, metadata: { fromStageId: token.currentStage.id, toStageId: nextStage.id, newStagePosition: result?.position ?? null } });
      } else {
        result = await tx.token.update({ where: { id: token.id }, data: { status: "COMPLETED", serviceCompletedAt: now, completedAt: now }, select: TOKEN_RESPONSE_SELECT });
        await logAudit(tx, { actorId: req.user.id, action: "TOKEN_COMPLETED", target: token.id, metadata: { finalStageId: token.currentStage.id } });
      }
      return result;
    });
    return res.status(200).json({ success: true, message: nextStage ? "Stage completed; moved to next queue" : "Token completed", token: updated });
  } catch (err) {
    console.error("[POST /api/staff/tokens/:id/complete] error:", err);
    return res.status(500).json({ success: false, message: "Failed to complete token" });
  }
});

export default router;
