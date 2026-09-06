import { Router } from "express";
import { prisma } from "../../db.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/auth.js";

const router = Router();

/**
 * POST /api/staff/tokens/check-in
 * Staff checks a citizen in by identifier: tokenNumber, tokenId (from QR),
 * or phone number.
 *
 * Body: { identifier: string }
 *
 * Rules:
 * - Must be STAFF or ADMIN.
 * - If identifier resolves to a token: verify token exists, is GENERATE,
 *   not expired, and hasn't been checked in already.
 * - If identifier resolves to a phone number: find the user's active token.
 * - On success: status → CHECKED_IN, set checkedInAt, return updated token.
 */
router.post("/check-in", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== "string") {
      return res.status(400).json({ success: false, message: "identifier is required" });
    }

    const normalized = identifier.trim();

    // Try to resolve by token id first (fastest, from QR payload).
    let token = await prisma.token.findFirst({
      where: { id: normalized },
      include: {
        service: { select: { id: true, nameEn: true, nameNe: true } },
        user: { select: { id: true, name: true, phoneNumber: true, role: true } },
      },
    });

    // If not found by id, try by token number (e.g. "A001").
    if (!token) {
      token = await prisma.token.findFirst({
        where: { tokenNumber: normalized },
        include: {
          service: { select: { id: true, nameEn: true, nameNe: true } },
          user: { select: { id: true, name: true, phoneNumber: true, role: true } },
        },
      });
    }

    // If still not found, try by citizen phone number (staff manual lookup).
    if (!token) {
      const phone = normalized.replace(/\s/g, "");
      if (/^(\+977)?9[6-9]\d{8}$/.test(phone)) {
        const user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
        if (user) {
          token = await prisma.token.findFirst({
            where: {
              userId: user.id,
              status: { in: ["GENERATED", "CHECKED_IN", "SERVING"] },
            },
            orderBy: { generatedAt: "desc" },
            include: {
              service: { select: { id: true, nameEn: true, nameNe: true } },
              user: { select: { id: true, name: true, phoneNumber: true, role: true } },
            },
          });
        }
      }
    }

    if (!token) {
      return res.status(404).json({ success: false, message: "Token or citizen not found" });
    }

    if (token.status !== "GENERATED") {
      return res.status(400).json({
        success: false,
        message: token.status === "CHECKED_IN"
          ? "Token already checked in"
          : token.status === "SERVING"
          ? "Token already being served"
          : "Token is no longer active",
      });
    }

    // Check for expiry (no-show): if the token was generated >15 minutes ago,
    // mark as EXPIRED (the cleanup sweeper does this, but guard here too).
    const minutesOld = (Date.now() - new Date(token.generatedAt).getTime()) / 60000;
    if (minutesOld > 3) {
      await prisma.token.update({
        where: { id: token.id },
        data: { status: "EXPIRED" },
      });
      return res.status(410).json({
        success: false,
        message: "Token has expired due to no-show",
      });
    }

    const updated = await prisma.token.update({
      where: { id: token.id },
      data: { status: "CHECKED_IN", checkedInAt: new Date() },
      include: {
        service: { select: { id: true, nameEn: true, nameNe: true } },
        user: { select: { id: true, name: true, phoneNumber: true, role: true } },
        currentStage: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Checked in",
      token: {
        id: updated.id,
        tokenNumber: updated.tokenNumber,
        status: updated.status,
        service: updated.service,
        user: updated.user,
        currentStage: updated.currentStage,
        checkedInAt: updated.checkedInAt,
      },
    });
  } catch (err) {
    console.error("[POST /api/staff/tokens/check-in] error:", err);
    res.status(500).json({ success: false, message: "Failed to check in token" });
  }
});

export default router;
