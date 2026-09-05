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

    // Transactional position reservation (atomic).
    const result = await prisma.$transaction(async (tx) => {
      const maxPos = await tx.token.aggregate({
        where: {
          serviceId,
          currentStageId: entryStage.id,
          status: { in: ["GENERATED", "CHECKED_IN", "SERVING"] },
        },
        _max: { position: true },
      });

      const nextPosition = (maxPos._max?.position ?? 0) + 1;
      const prefix = service.office?.nameEn?.charAt(0)?.toUpperCase() ?? "A";
      const number = String(nextPosition).padStart(3, "0");
      const tokenNumber = `${prefix}${number}`;

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
    console.error("[POST /api/tokens] error:", err);
    res.status(500).json({ success: false, message: "Failed to generate token" });
  }
});

/**
 * GET /api/tokens/:id
 * Citizen polls for token status. Requires auth (own token or staff/admin).
 */
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
        completedAt: token.completedAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/tokens/:id] error:", err);
    res.status(500).json({ success: false, message: "Failed to load token" });
  }
});

export default router;
