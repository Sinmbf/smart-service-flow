import { Router } from "express";

const router = Router();

/**
 * POST /api/auth/logout
 *
 * Stateless no-op. The JWT itself is the auth credential, and the client
 * (AuthContext.logout) clears the token from localStorage. This endpoint
 * exists so the client has a server round-trip target for future use:
 *   - per-session audit logging ("user X signed out at time Y")
 *   - token revocation lists (e.g. if a user changes their password)
 *   - clearing any per-session server state (e.g. cached OTP counters)
 *
 * Always returns 200 to keep the client contract simple.
 */
router.post("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export default router;
