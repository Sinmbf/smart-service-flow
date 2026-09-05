import { verifyToken } from "../services/auth/jwt.js";
import { prisma } from "../db.js";

/**
 * requireAuth — parses `Authorization: Bearer <token>`, attaches `req.user`.
 * Returns 401 if missing/invalid.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or malformed Authorization header" });
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyToken(token);

  if (!payload || !payload.sub) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  // Hydrate the user from DB so req.user is always fresh
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      employeeId: true,
      role: true,
      preferredLanguage: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "User not found or deactivated" });
  }

  req.user = user;
  next();
}

/**
 * requireRole(...allowed) — gates routes to specific roles.
 * Must be used after requireAuth.
 * Returns 403 on mismatch.
 */
export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    next();
  };
}
