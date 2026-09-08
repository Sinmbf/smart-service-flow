import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

/**
 * GET /api/queue/status
 * Returns the current queue status for all services.
 * Numbers are derived from actual DB tokens, not hardcoded mocks.
 */
router.get("/status", async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        tokens: {
          where: { status: { in: ["GENERATED", "CHECKED_IN"] } },
          orderBy: { position: "asc" },
        },
      },
    });

    const liveServices = services.map((s) => {
      const waiting = s.tokens.filter((t) => t.status === "GENERATED").length;
      const servingCount = s.tokens.filter(
        (t) => t.status === "CHECKED_IN",
      ).length;
      // console.log(s.tokens.map((t) => t.tokenNumber).length == 0);
      const lastNumber =
        s.tokens.length > 0 ? Math.max(...s.tokens.map((t) => t.position)) : 0;
      return {
        id: s.id,
        name: s.nameEn,
        currentNumber: servingCount,
        currentToken: s.tokens.map((t) => t.tokenNumber)?.[0] || null,
        lastNumber,
        waiting,
        estimatedWaitMinutes: waiting * 7,
      };
    });

    res.status(200).json({
      success: true,
      services: liveServices,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/queue/status] error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load queue status" });
  }
});

/**
 * GET /api/queue/services
 * Returns the list of available services.
 */
router.get("/services", async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, nameEn: true, nameNe: true, category: true },
      orderBy: { nameEn: "asc" },
    });

    res.status(200).json({
      success: true,
      services: services.map((s) => ({
        id: s.id,
        name: s.nameEn,
        nameNe: s.nameNe,
        category: s.category,
      })),
    });
  } catch (err) {
    console.error("[/api/queue/services] error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load services" });
  }
});

/**
 * GET /api/queue/:serviceId
 * Returns the queue status for a single service.
 */
router.get("/:serviceId", async (req, res) => {
  const { serviceId } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        tokens: {
          where: { status: { in: ["GENERATED", "CHECKED_IN"] } },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const tokens = service.tokens ?? [];
    const waiting = tokens.filter((t) => t.status === "GENERATED").length;
    const serving = tokens.find((t) => t.status === "CHECKED_IN");
    const lastNumber =
      tokens.length > 0 ? Math.max(...tokens.map((t) => t.position)) : 0;

    res.status(200).json({
      success: true,
      service: {
        id: service.id,
        name: service.nameEn,
        currentNumber: serving?.position ?? lastNumber,
        lastNumber,
        waiting,
        estimatedWaitMinutes: waiting * 7,
      },
    });
  } catch (err) {
    console.error("[/api/queue/:serviceId] error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load service queue" });
  }
});

export default router;
// POST assign/release plain JS
import { assign, release, counters } from "../services/counter.js";
// POST /api/queue/:service/counter - assign/release
