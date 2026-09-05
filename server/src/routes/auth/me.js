import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";

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

export default router;
