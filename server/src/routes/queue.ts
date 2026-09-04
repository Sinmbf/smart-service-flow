import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db";

const router = Router();

/**
 * GET /api/queue/status
 * Returns the current queue status for all services.
 * Backed by DB (Token + Service). Live numbers are derived from
 * the actual current tokens, not hardcoded mocks.
 */
router.get("/status", async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        tokens: {
          where: { status: { in: ["GENERATED", "CHECKED_IN", "SERVING"] } },
          orderBy: { position: "asc" },
        },
      },
    });

    const liveServices = services.map((s) => {
      const waiting = s.tokens.filter((t) => t.status === "GENERATED" || t.status === "CHECKED_IN").length;
      const serving = s.tokens.find((t) => t.status === "SERVING");
      const lastNumber = s.tokens.length > 0 ? Math.max(...s.tokens.map((t) => t.position)) : 0;

      // Rough estimate: waiting × 7 min (placeholder until Increment 5 dynamic engine)
      const estimatedWaitMinutes = waiting * 7;

      return {
        id: s.id,
        name: s.nameEn, // EN default; client can translate via i18n keys
        currentNumber: serving ? serving.position : lastNumber,
        lastNumber,
        waiting,
        estimatedWaitMinutes,
      };
    });

    res.status(200).json({
      success: true,
      services: liveServices,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/queue/status] error:", err);
    res.status(500).json({ success: false, message: "Failed to load queue status" });
  }
});

/**
 * GET /api/queue/services
 * Returns the list of available services.
 */
router.get("/services", async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, nameEn: true, nameNe: true, category: true },
      orderBy: { nameEn: "asc" },
    });

    res.status(200).json({
      success: true,
      services: services.map((s) => ({ id: s.id, name: s.nameEn, nameNe: s.nameNe, category: s.category })),
    });
  } catch (err) {
    console.error("[/api/queue/services] error:", err);
    res.status(500).json({ success: false, message: "Failed to load services" });
  }
});

/**
 * GET /api/queue/:serviceId
 * Returns the queue status for a single service.
 */
router.get("/:serviceId", async (req: Request, res: Response) => {
  const { serviceId } = req.params;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        tokens: {
          where: { status: { in: ["GENERATED", "CHECKED_IN", "SERVING"] } },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const waiting = service.tokens.filter((t) => t.status === "GENERATED" || t.status === "CHECKED_IN").length;
    const serving = service.tokens.find((t) => t.status === "SERVING");
    const lastNumber = service.tokens.length > 0 ? Math.max(...service.tokens.map((t) => t.position)) : 0;

    res.status(200).json({
      success: true,
      service: {
        id: service.id,
        name: service.nameEn,
        currentNumber: serving ? serving.position : lastNumber,
        lastNumber,
        waiting,
        estimatedWaitMinutes: waiting * 7,
      },
    });
  } catch (err) {
    console.error("[/api/queue/:serviceId] error:", err);
    res.status(500).json({ success: false, message: "Failed to load service queue" });
  }
});

export default router;
