import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { prisma } from "../../db.js";
import { Language } from "../../generated/prisma/index.js";

const router = Router();

/**
 * GET /api/auth/me
 * Returns the current user (decoded from JWT).
 * Requires a valid `Authorization: Bearer <token>` header.
 */
router.get("/", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * PUT /api/auth/me/language
 * Persist the current user's `preferredLanguage`.
 * Body: { language: "EN" | "NE" } (case-insensitive)
 */
router.put("/language", requireAuth, async (req, res) => {
  const { language } = req.body;

  if (typeof language !== "string") {
    return res.status(400).json({
      success: false,
      message: "Body must include { language: 'EN' | 'NE' }",
    });
  }

  const normalized = language.toUpperCase();
  if (normalized !== "EN" && normalized !== "NE") {
    return res.status(400).json({
      success: false,
      message: `Invalid language '${language}'. Must be 'EN' or 'NE'.`,
    });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferredLanguage: normalized },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        employeeId: true,
        role: true,
        preferredLanguage: true,
        isActive: true,
        lastLoginAt: true,
        passwordChangedAt: true,
      },
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error("[PUT /api/auth/me/language]", err);
    res.status(500).json({
      success: false,
      message: "Failed to update language preference",
    });
  }
});

export default router;
