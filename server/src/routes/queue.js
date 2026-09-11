import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

const WAITING_STATUS = "WAITING";
const CALLED_STATUS = "CALLED";
const CHECKED_IN_STATUS = "CHECKED_IN";
const SERVING_STATUS = "SERVING";

/**
 * Build queue information from a service's active tokens.
 *
 * WAITING:
 *   Citizen has reserved a queue position.
 *
 * SERVING:
 *   Citizen has checked in at the counter and service is active.
 */
function buildQueueStatus(service) {
  const tokens = service.tokens ?? [];

  const waitingTokens = tokens.filter(
    (token) => token.status === WAITING_STATUS,
  );

  const calledTokens = tokens.filter(
    (token) => token.status === CALLED_STATUS,
  );

  const checkedInTokens = tokens.filter(
    (token) => token.status === CHECKED_IN_STATUS,
  );

  const servingTokens = tokens.filter(
    (token) => token.status === SERVING_STATUS,
  );

  /* Multiple counters may be serving simultaneously. */
  const servingTokenNumbers = servingTokens.map((token) => token.tokenNumber);
  const calledTokenNumbers = calledTokens.map((token) => token.tokenNumber);

  /*
   * Position represents the token's position in the queue.
   * We use the highest position among active tokens as the last
   * currently active queue position.
   */
  const lastNumber = waitingTokens.length;

  return {
    id: service.id,
    name: service.nameEn,

    // Number of citizens currently waiting.
    waiting: waitingTokens.length,

    // Number of citizens currently called and waiting to check in.
    called: calledTokens.length,
    calledTokenNumbers,

    // Number of citizens physically checked in or actively being served.
    checkedIn: checkedInTokens.length,
    currentNumber: servingTokens.length,

    // All tokens currently being served.
    currentToken: servingTokenNumbers[0] ?? null,
    servingTokenNumbers,

    // Queue positions are local to this service stage.
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
              in: [WAITING_STATUS, CALLED_STATUS, CHECKED_IN_STATUS, SERVING_STATUS],
            },
          },

          orderBy: [{ stageEnteredAt: "asc" }, { generatedAt: "asc" }, { id: "asc" }],

          select: {
            id: true,
            tokenNumber: true,
            position: true,
            status: true,
            stageEnteredAt: true,
            generatedAt: true,
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
              in: [WAITING_STATUS, CALLED_STATUS, CHECKED_IN_STATUS, SERVING_STATUS],
            },
          },

          orderBy: [{ stageEnteredAt: "asc" }, { generatedAt: "asc" }, { id: "asc" }],

          select: {
            id: true,
            tokenNumber: true,
            position: true,
            status: true,
            stageEnteredAt: true,
            generatedAt: true,
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
