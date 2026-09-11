import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const normalizeReadFilter = (value) => {
  if (value === "unread") return { read: false };
  if (value === "read") return { read: true };
  return {};
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const type = typeof req.query.type === "string" && req.query.type.trim()
      ? req.query.type.trim()
      : null;
    const where = {
      userId: req.user.id,
      ...normalizeReadFilter(req.query.read),
      ...(type && type !== "all" ? { type } : {}),
    };

    const [notifications, unreadCount, totalCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: req.user.id, read: false },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
      totalCount,
    });
  } catch (err) {
    console.error("[GET /api/notifications] error:", err);
    return res.status(500).json({ success: false, message: "Failed to load notifications" });
  }
});


router.delete("/", requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });
    return res.json({ success: true, count: result.count });
  } catch (err) {
    console.error("[DELETE /api/notifications] error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete notifications" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(`[DELETE /api/notifications/${req.params.id}] error:`, err);
    return res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
});

router.post("/read-all", requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    return res.json({ success: true, count: result.count });
  } catch (err) {
    console.error("[POST /api/notifications/read-all] error:", err);
    return res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
});

router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[POST /api/notifications/:id/read] error:", err);
    return res.status(500).json({ success: false, message: "Failed to update notification" });
  }
});

export default router;
