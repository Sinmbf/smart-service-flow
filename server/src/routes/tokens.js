import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken } from "../services/auth/jwt.js";

const router = Router();

/**
 * POST /api/tokens
 * Create a digital token for a service. Requires authentication.
 *
 * Body: { serviceId: string }
 * Response: { success, token: {...}, qrPayload }
 *
 * The token reserves its queue position transactionally (atomic MAX(position)+1
 * for this service+stage).
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId || typeof serviceId !== "string") {
      return res.status(400).json({ success: false, message: "serviceId is required" });
    }

    // Verify service exists and is active.
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { office: { select: { nameEn: true } } },
    });
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Pick the first stage (entry stage for this service).
    const entryStage = await prisma.serviceStage.findFirst({
      where: { serviceId, stageOrder: 1 },
      orderBy: { stageOrder: "asc" },
    });
    if (!entryStage) {
      return res.status(400).json({ success: false, message: "Service has no entry stage" });
    }

    // Transactional position reservation (atomic). The single-active-token
    // check runs INSIDE the transaction so two concurrent requests can't
    // both pass the check and create two tokens (race condition).
    // Retry up to maxRetries times on P2002 (token-number collision).
    let result = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        result = await prisma.$transaction(async (tx) => {
          // Single-active-token guard (atomic with the insert).
          const activeToken = await tx.token.findFirst({
            where: {
              userId: req.user.id,
              status: { in: ["GENERATED", "CHECKED_IN", "SERVING"] },
            },
            include: {
              service: { select: { id: true, nameEn: true, nameNe: true } },
            },
          });
          if (activeToken) {
            const err = new Error("ACTIVE_TOKEN_EXISTS");
            err.code = "ACTIVE_TOKEN_EXISTS";
            err.activeToken = activeToken;
            throw err;
          }

          // Queue position: number of currently active tokens ahead of you.
          const activeCount = await tx.token.count({
            where: {
              serviceId,
              currentStageId: entryStage.id,
              status: { in: ["GENERATED", "CHECKED_IN", "SERVING"] },
            },
          });
          const nextPosition = activeCount + 1;

          // Human-readable token number: must be globally unique. The
          // prefix is the office's first letter + a 2-char hash of the
          // office id (to disambiguate offices that share a first letter,
          // e.g. "Department of Transport Management" and "District
          // Administration Office" both start with D). The sequence
          // is the office-wide lifetime count.
          const officeId = service.officeId || "";
          const prefix = (service.office?.nameEn?.charAt(0) || "X").toUpperCase();
          const officeTag = officeId.slice(-2).toUpperCase();
          const sequenceCount = await tx.token.count({
            where: { tokenNumber: { startsWith: prefix + officeTag } },
          });
          const nextSequence = sequenceCount + 1;
          const number = String(nextSequence).padStart(3, "0");
          const tokenNumber = `${prefix}${officeTag}${number}`;

          const token = await tx.token.create({
            data: {
              tokenNumber,
              userId: req.user.id,
              serviceId,
              currentStageId: entryStage.id,
              position: nextPosition,
              status: "GENERATED",
              generatedAt: new Date(),
            },
            include: { service: true, currentStage: true },
          });

          return { token, tokenNumber, position: nextPosition };
        });
        break; // success — exit retry loop
      } catch (innerErr) {
        if (innerErr.code === "ACTIVE_TOKEN_EXISTS") {
          return res.status(409).json({
            success: false,
            code: "ACTIVE_TOKEN_EXISTS",
            message: "You already have an active token. Please complete or cancel it first.",
            activeToken: innerErr.activeToken,
          });
        }
        if (innerErr.code === "P2002") {
          retries++;
          if (retries >= maxRetries) {
            console.error("[POST /api/tokens] unique-constraint after retries:", innerErr);
            return res.status(409).json({
              success: false,
              message: "Could not reserve unique token number; please retry",
            });
          }
          // Retry: the next iteration will re-read lifetimeCount (now N+1
          // because the previous insert committed) and use a unique number.
          continue;
        }
        // Unknown error: re-throw to the outer catch.
        throw innerErr;
      }
    }
    if (!result) {
      return res.status(500).json({ success: false, message: "Failed to generate token" });
    }

    const { token, tokenNumber, position } = result;

    // Build a signed URL payload for QR scanning.
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const urlPayload = `${baseUrl}/verify/${token.id}?sig=${signToken({ tokenId: token.id, sub: req.user.id })}`;

    res.status(201).json({
      success: true,
      message: "Token generated",
      token: {
        id: token.id,
        tokenNumber,
        position,
        status: token.status,
        serviceId: token.serviceId,
        serviceNameEn: service.nameEn,
        currentStageId: token.currentStageId,
        generatedAt: token.generatedAt,
      },
      qrPayload: urlPayload,
    });
  } catch (err) {
    if (err.code === "ACTIVE_TOKEN_EXISTS") {
      return res.status(409).json({
        success: false,
        code: "ACTIVE_TOKEN_EXISTS",
        message: "You already have an active token. Please complete or cancel it first.",
        activeToken: err.activeToken,
      });
    }
    if (err.code === "P2002") {
      console.error("[POST /api/tokens] unique-constraint error:", err);
      return res.status(409).json({ success: false, message: "Token number already taken; please retry" });
    }
    console.error("[POST /api/tokens] error:", err);
    res.status(500).json({ success: false, message: "Failed to generate token" });
  }
});

/**
 * GET /api/tokens?mine=true&status=active
 * List the current citizen's active (non-terminal) tokens.
 * `?all=true` returns all of the user's tokens (any status).
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const mine = req.query.mine === "true" || req.query.mine === "1";
    const all = req.query.all === "true" || req.query.all === "1";
    if (!mine) {
      return res.status(400).json({ success: false, message: "Only mine=true is supported" });
    }
    const where = { userId: req.user.id };
    if (!all) {
      where.status = { in: ["GENERATED", "CHECKED_IN", "SERVING"] };
    }
    const tokens = await prisma.token.findMany({
      where,
      include: {
        service: { select: { id: true, nameEn: true, nameNe: true } },
        currentStage: { select: { id: true, stageOrder: true, nameEn: true, nameNe: true } },
      },
      orderBy: { generatedAt: "desc" },
      take: 25,
    });
    res.status(200).json({ success: true, tokens });
  } catch (err) {
    console.error("[GET /api/tokens] error:", err);
    res.status(500).json({ success: false, message: "Failed to load tokens" });
  }
});

/**
 * GET /api/tokens/:id
 * Citizen polls for token status. Requires auth (own token or staff/admin).
 */
router.post("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const token = await prisma.token.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, role: true } } },
    });

    if (!token) {
      return res.status(404).json({ success: false, message: "Token not found" });
    }

    // Only the owner (or staff/admin) can cancel.
    const allowedRoles = ["STAFF", "ADMIN"];
    const isOwn = token.userId === req.user.id;
    const isStaff = allowedRoles.includes(req.user.role);
    if (!isOwn && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Only cancel from non-terminal statuses.
    if (["COMPLETED", "CANCELLED", "SKIPPED", "EXPIRED"].includes(token.status)) {
      return res.status(400).json({ success: false, message: "Token is already terminal" });
    }

    await prisma.token.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    res.status(200).json({ success: true, message: "Token cancelled" });
  } catch (err) {
    console.error("[POST /api/tokens/:id/cancel] error:", err);
    res.status(500).json({ success: false, message: "Failed to cancel token" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const token = await prisma.token.findUnique({
      where: { id: req.params.id },
      include: {
        currentStage: true,
        service: { select: { id: true, nameEn: true, nameNe: true } },
        user: { select: { id: true, name: true, phoneNumber: true, role: true } },
      },
    });

    if (!token) {
      return res.status(404).json({ success: false, message: "Token not found" });
    }

    const allowedRoles = ["STAFF", "ADMIN"];
    const isOwn = token.userId === req.user.id;
    const isStaff = allowedRoles.includes(req.user.role);

    if (!isOwn && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized for this token" });
    }

    // Build the QR payload so a fresh page reload can still display the
    // scannable code (the client can't re-sign the JWT without the secret).
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const qrPayload = `${baseUrl}/verify/${token.id}?sig=${signToken({ tokenId: token.id, sub: token.userId })}`;

    res.status(200).json({
      success: true,
      token: {
        id: token.id,
        tokenNumber: token.tokenNumber,
        position: token.position,
        status: token.status,
        service: {
          id: token.service.id,
          nameEn: token.service.nameEn,
          nameNe: token.service.nameNe,
        },
        currentStage: token.currentStage
          ? {
              id: token.currentStage.id,
              stageOrder: token.currentStage.stageOrder,
              nameEn: token.currentStage.nameEn,
              nameNe: token.currentStage.nameNe,
            }
          : null,
        user: token.user,
        generatedAt: token.generatedAt,
        checkedInAt: token.checkedInAt,
        qrPayload,
        completedAt: token.completedAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/tokens/:id] error:", err);
    res.status(500).json({ success: false, message: "Failed to load token" });
  }
});

export default router;
