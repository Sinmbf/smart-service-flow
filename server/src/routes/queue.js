import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

const WAITING_STATUS = "GENERATED";
const SERVING_STATUS = "CHECKED_IN";

/**
 * Build queue information from a service's active tokens.
 *
 * GENERATED:
 *   Citizen has generated a token and is waiting.
 *
 * CHECKED_IN:
 *   Citizen has checked in and is currently being served.
 */
function buildQueueStatus(service) {
  const tokens = service.tokens ?? [];

  const waitingTokens = tokens.filter(
    (token) => token.status === WAITING_STATUS,
  );

  const servingTokens = tokens.filter(
    (token) => token.status === SERVING_STATUS,
  );

  /*
   * In the current system, CHECKED_IN represents a token being served.
   *
   * If multiple counters are introduced later, there may be multiple
   * CHECKED_IN tokens. For now we display the first one by queue position.
   */
  const currentToken = servingTokens[0] ?? null;

  /*
   * Position represents the token's position in the queue.
   * We use the highest position among active tokens as the last
   * currently active queue position.
   */
  const lastNumber =
    tokens.length > 0
      ? Math.max(...tokens.map((token) => token.position ?? 0))
      : 0;

  return {
    id: service.id,
    name: service.nameEn,

    // Number of citizens currently waiting.
    waiting: waitingTokens.length,

    // Number of currently checked-in/serving tokens.
    currentNumber: servingTokens.length,

    // Actual token currently being served.
    currentToken: currentToken?.tokenNumber ?? null,

    // Last active queue position.
    lastNumber,

    // Current simple waiting-time estimate.
    estimatedWaitMinutes: waitingTokens.length * 7,
  };
}

/**
 * GET /api/queue/status
 *
 * Returns the current queue status for all active services.
 */
router.get("/status", async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },

      include: {
        tokens: {
          where: {
            status: {
              in: [WAITING_STATUS, SERVING_STATUS],
            },
          },

          orderBy: {
            position: "asc",
          },

          select: {
            id: true,
            tokenNumber: true,
            position: true,
            status: true,
          },
        },
      },

      orderBy: {
        nameEn: "asc",
      },
    });

    const liveServices = services.map(buildQueueStatus);

    return res.status(200).json({
      success: true,
      services: liveServices,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/queue/status] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load queue status",
    });
  }
});

/**
 * GET /api/queue/services
 *
 * Returns the list of active services.
 */
router.get("/services", async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },

      select: {
        id: true,
        nameEn: true,
        nameNe: true,
        category: true,
      },

      orderBy: {
        nameEn: "asc",
      },
    });

    return res.status(200).json({
      success: true,

      services: services.map((service) => ({
        id: service.id,
        name: service.nameEn,
        nameNe: service.nameNe,
        category: service.category,
      })),
    });
  } catch (err) {
    console.error("[/api/queue/services] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load services",
    });
  }
});

/**
 * GET /api/queue/:serviceId
 *
 * Returns queue status for a single service.
 */
router.get("/:serviceId", async (req, res) => {
  const { serviceId } = req.params;

  try {
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },

      include: {
        tokens: {
          where: {
            status: {
              in: [WAITING_STATUS, SERVING_STATUS],
            },
          },

          orderBy: {
            position: "asc",
          },

          select: {
            id: true,
            tokenNumber: true,
            position: true,
            status: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const queue = buildQueueStatus(service);

    return res.status(200).json({
      success: true,

      service: {
        ...queue,
      },
    });
  } catch (err) {
    console.error("[/api/queue/:serviceId] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load service queue",
    });
  }
});

export default router;
