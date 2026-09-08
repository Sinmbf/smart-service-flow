import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { signToken } from "../services/auth/jwt.js";

const router = Router();

const ACTIVE_STATUSES = ["GENERATED", "CHECKED_IN", "SERVING"];
const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "SKIPPED", "EXPIRED"];

const MAX_TRANSACTION_RETRIES = 5;

/**
 * Build the human-readable token number.
 *
 * Example:
 *   Department of Transport + officeId ending in 4A
 *   -> D4A001
 *
 * The numbering remains office-wide and lifetime-based,
 * preserving the existing application's behavior.
 */
function buildTokenPrefix(service) {
  const officeId = service.officeId || "";
  const officeInitial = (
    service.office?.nameEn?.charAt(0) || "X"
  ).toUpperCase();

  const officeTag = officeId.slice(-2).toUpperCase();

  return `${officeInitial}${officeTag}`;
}

/**
 * Calculate the next lifetime sequence for an office.
 *
 * We intentionally inspect all matching token numbers instead of relying
 * on lexical ordering because token numbers can eventually exceed 999.
 *
 * Example:
 *   D4A001
 *   D4A002
 *   D4A999
 *   D4A1000
 */
async function getNextSequence(tx, tokenPrefix) {
  const existingTokens = await tx.token.findMany({
    where: {
      tokenNumber: {
        startsWith: tokenPrefix,
      },
    },
    select: {
      tokenNumber: true,
    },
  });

  let maxSequence = 0;

  for (const token of existingTokens) {
    const sequencePart = token.tokenNumber.slice(tokenPrefix.length);
    const sequence = Number.parseInt(sequencePart, 10);

    if (Number.isInteger(sequence)) {
      maxSequence = Math.max(maxSequence, sequence);
    }
  }

  return maxSequence + 1;
}

/**
 * POST /api/tokens
 *
 * Create a digital token for a service.
 *
 * Body:
 *   {
 *     serviceId: string
 *   }
 *
 * Response:
 *   {
 *     success,
 *     token,
 *     qrPayload
 *   }
 *
 * Concurrency safety:
 *   - Active-token check happens inside the transaction.
 *   - Queue-position calculation happens inside the transaction.
 *   - Token-number calculation happens inside the transaction.
 *   - Serializable isolation prevents concurrent transactions from
 *     incorrectly observing the same queue state.
 *   - Serialization failures are automatically retried.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { serviceId } = req.body;

    // ---------------------------------------------------------
    // 1. Validate request
    // ---------------------------------------------------------
    if (!serviceId || typeof serviceId !== "string") {
      return res.status(400).json({
        success: false,
        message: "serviceId is required",
      });
    }

    // ---------------------------------------------------------
    // 2. Verify service
    // ---------------------------------------------------------
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        office: {
          select: {
            nameEn: true,
          },
        },
      },
    });

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // ---------------------------------------------------------
    // 3. Find entry stage
    // ---------------------------------------------------------
    const entryStage = await prisma.serviceStage.findFirst({
      where: {
        serviceId,
        stageOrder: 1,
      },
      orderBy: {
        stageOrder: "asc",
      },
    });

    if (!entryStage) {
      return res.status(400).json({
        success: false,
        message: "Service has no entry stage",
      });
    }

    // ---------------------------------------------------------
    // 4. Serializable transaction with retry
    // ---------------------------------------------------------
    let result = null;

    for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
      try {
        result = await prisma.$transaction(
          async (tx) => {
            // -------------------------------------------------
            // 4.1 Prevent multiple active tokens per citizen
            // -------------------------------------------------
            const activeToken = await tx.token.findFirst({
              where: {
                userId: req.user.id,
                status: {
                  in: ACTIVE_STATUSES,
                },
              },
              include: {
                service: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameNe: true,
                  },
                },
              },
              orderBy: {
                generatedAt: "desc",
              },
            });

            if (activeToken) {
              const error = new Error("ACTIVE_TOKEN_EXISTS");

              error.code = "ACTIVE_TOKEN_EXISTS";
              error.activeToken = activeToken;

              throw error;
            }

            // -------------------------------------------------
            // 4.2 Determine current active queue size
            // -------------------------------------------------
            const activeCount = await tx.token.count({
              where: {
                serviceId,
                currentStageId: entryStage.id,
                status: {
                  in: ACTIVE_STATUSES,
                },
              },
            });

            const nextPosition = activeCount + 1;

            // -------------------------------------------------
            // 4.3 Determine next lifetime token number
            // -------------------------------------------------
            const tokenPrefix = buildTokenPrefix(service);

            const nextSequence = await getNextSequence(tx, tokenPrefix);

            const tokenNumber = `${tokenPrefix}${String(nextSequence).padStart(
              3,
              "0",
            )}`;

            // -------------------------------------------------
            // 4.4 Create token
            // -------------------------------------------------
            const generatedAt = new Date();

            const token = await tx.token.create({
              data: {
                tokenNumber,
                userId: req.user.id,
                serviceId,
                currentStageId: entryStage.id,
                position: nextPosition,
                status: "GENERATED",
                generatedAt,
                qrPayload: Buffer.from(`${tokenNumber}:${serviceId}`).toString(
                  "base64",
                ),
              },
              include: {
                service: true,
                currentStage: true,
              },
            });

            return {
              token,
              tokenNumber,
              position: nextPosition,
            };
          },
          {
            isolationLevel: "Serializable",
          },
        );

        // Transaction succeeded.
        break;
      } catch (innerError) {
        // -----------------------------------------------------
        // Active token is a normal business-rule response.
        // -----------------------------------------------------
        if (innerError.code === "ACTIVE_TOKEN_EXISTS") {
          return res.status(409).json({
            success: false,
            code: "ACTIVE_TOKEN_EXISTS",
            message:
              "You already have an active token. Please complete or cancel it first.",
            activeToken: innerError.activeToken,
          });
        }

        // -----------------------------------------------------
        // P2034:
        // Prisma reports this when a serializable transaction
        // experiences a write conflict/deadlock.
        //
        // Retry because another transaction was modifying
        // the same queue/token state at the same time.
        // -----------------------------------------------------
        if (innerError.code === "P2034") {
          console.warn(
            `[POST /api/tokens] transaction conflict. Retry ${attempt}/${MAX_TRANSACTION_RETRIES}`,
          );

          if (attempt < MAX_TRANSACTION_RETRIES) {
            continue;
          }

          console.error(
            "[POST /api/tokens] transaction conflict after retries:",
            innerError,
          );

          return res.status(409).json({
            success: false,
            code: "TOKEN_CONCURRENCY_CONFLICT",
            message:
              "The queue was updated by another request. Please try again.",
          });
        }

        // -----------------------------------------------------
        // P2002:
        // Unique token-number collision.
        //
        // This should be rare with Serializable isolation,
        // but retrying makes the endpoint more resilient.
        // -----------------------------------------------------
        if (innerError.code === "P2002") {
          console.warn(
            `[POST /api/tokens] token-number collision. Retry ${attempt}/${MAX_TRANSACTION_RETRIES}`,
          );

          if (attempt < MAX_TRANSACTION_RETRIES) {
            continue;
          }

          console.error(
            "[POST /api/tokens] unique constraint after retries:",
            innerError,
          );

          return res.status(409).json({
            success: false,
            code: "TOKEN_NUMBER_CONFLICT",
            message:
              "Could not reserve a unique token number. Please try again.",
          });
        }

        // Unknown error.
        throw innerError;
      }
    }

    // ---------------------------------------------------------
    // 5. Ensure transaction produced a result
    // ---------------------------------------------------------
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate token",
      });
    }

    const { token, tokenNumber, position } = result;

    // ---------------------------------------------------------
    // 6. Build signed QR verification URL
    // ---------------------------------------------------------
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const signature = signToken({
      tokenId: token.id,
      sub: req.user.id,
    });

    const qrPayload = `${baseUrl}/verify/${token.id}?sig=${signature}`;

    // ---------------------------------------------------------
    // 7. Return generated token
    // ---------------------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Token generated",
      token: {
        id: token.id,
        tokenNumber,
        position,
        status: token.status,
        serviceId: token.serviceId,
        serviceNameEn: service.nameEn,
        currentStageId: token.currentStageId,
        generatedAt: token.generatedAt,
      },
      qrPayload,
    });
  } catch (err) {
    // ---------------------------------------------------------
    // Global error handling
    // ---------------------------------------------------------
    if (err.code === "ACTIVE_TOKEN_EXISTS") {
      return res.status(409).json({
        success: false,
        code: "ACTIVE_TOKEN_EXISTS",
        message:
          "You already have an active token. Please complete or cancel it first.",
        activeToken: err.activeToken,
      });
    }

    if (err.code === "P2002") {
      console.error("[POST /api/tokens] unique constraint error:", err);

      return res.status(409).json({
        success: false,
        code: "TOKEN_NUMBER_CONFLICT",
        message: "Token number already exists. Please try again.",
      });
    }

    if (err.code === "P2034") {
      console.error("[POST /api/tokens] transaction conflict:", err);

      return res.status(409).json({
        success: false,
        code: "TOKEN_CONCURRENCY_CONFLICT",
        message: "The queue was updated by another request. Please try again.",
      });
    }

    console.error("[POST /api/tokens] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
});

/**
 * GET /api/tokens?mine=true&status=active
 *
 * List the current citizen's active tokens.
 *
 * `?all=true` returns all tokens regardless of status.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const mine = req.query.mine === "true" || req.query.mine === "1";

    const all = req.query.all === "true" || req.query.all === "1";

    if (!mine) {
      return res.status(400).json({
        success: false,
        message: "Only mine=true is supported",
      });
    }

    const where = {
      userId: req.user.id,
    };

    if (!all) {
      where.status = {
        in: ACTIVE_STATUSES,
      };
    }

    const tokens = await prisma.token.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            nameEn: true,
            nameNe: true,
          },
        },
        currentStage: {
          select: {
            id: true,
            stageOrder: true,
            nameEn: true,
            nameNe: true,
          },
        },
      },
      orderBy: {
        generatedAt: "desc",
      },
      take: 25,
    });

    return res.status(200).json({
      success: true,
      tokens,
    });
  } catch (err) {
    console.error("[GET /api/tokens] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load tokens",
    });
  }
});

/**
 * POST /api/tokens/:id/cancel
 *
 * Cancel a citizen's token.
 */
router.post("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const token = await prisma.token.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    const allowedRoles = ["STAFF", "ADMIN"];

    const isOwn = token.userId === req.user.id;

    const isStaff = allowedRoles.includes(req.user.role);

    if (!isOwn && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (TERMINAL_STATUSES.includes(token.status)) {
      return res.status(400).json({
        success: false,
        message: "Token is already terminal",
      });
    }

    await prisma.token.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Token cancelled",
    });
  } catch (err) {
    console.error("[POST /api/tokens/:id/cancel] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel token",
    });
  }
});

/**
 * GET /api/tokens/:id
 *
 * Citizen polls for token status.
 * Staff/Admin can access other users' tokens.
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const token = await prisma.token.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        currentStage: true,
        service: {
          select: {
            id: true,
            nameEn: true,
            nameNe: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    const allowedRoles = ["STAFF", "ADMIN"];

    const isOwn = token.userId === req.user.id;

    const isStaff = allowedRoles.includes(req.user.role);

    if (!isOwn && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for this token",
      });
    }

    // Build a fresh QR payload so the QR code still works after
    // refreshing/reopening the token page.
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const signature = signToken({
      tokenId: token.id,
      sub: token.userId,
    });

    const qrPayload = `${baseUrl}/verify/${token.id}?sig=${signature}`;

    return res.status(200).json({
      success: true,
      token: {
        id: token.id,
        tokenNumber: token.tokenNumber,
        position: token.position,
        status: token.status,
        service: {
          id: token.service.id,
          nameEn: token.service.nameEn,
          nameNe: token.service.nameNe,
        },
        currentStage: token.currentStage
          ? {
              id: token.currentStage.id,
              stageOrder: token.currentStage.stageOrder,
              nameEn: token.currentStage.nameEn,
              nameNe: token.currentStage.nameNe,
            }
          : null,
        user: token.user,
        generatedAt: token.generatedAt,
        checkedInAt: token.checkedInAt,
        qrPayload,
        completedAt: token.completedAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/tokens/:id] error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load token",
    });
  }
});

export default router;
