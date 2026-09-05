import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

/**
 * GET /api/services
 * Lists active services with their office. Supports:
 *   - ?search=<text>  (matches nameEn/nameNe/category, case-insensitive)
 *   - ?page=<n>&pageSize=<n>  (defaults page 1, pageSize 20, max 100)
 *   - ?lang=en|ne     (informational; both names are always returned)
 * The client picks nameEn/nameNe based on the active language.
 */
router.get("/", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));

    const where = { isActive: true };
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: "insensitive" } },
        { nameNe: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        include: { office: { select: { id: true, nameEn: true, nameNe: true, location: true } } },
        orderBy: { nameEn: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.status(200).json({
      success: true,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      services: services.map((s) => ({
        id: s.id,
        nameEn: s.nameEn,
        nameNe: s.nameNe,
        descriptionEn: s.descriptionEn,
        descriptionNe: s.descriptionNe,
        category: s.category,
        office: s.office,
      })),
    });
  } catch (err) {
    console.error("[GET /api/services] error:", err);
    res.status(500).json({ success: false, message: "Failed to load services" });
  }
});

/**
 * GET /api/services/:id
 * Full service detail: office, ordered stages, and each stage's documents.
 */
router.get("/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        office: true,
        stages: {
          orderBy: { stageOrder: "asc" },
          include: {
            documents: {
              where: { isActive: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, service });
  } catch (err) {
    console.error("[GET /api/services/:id] error:", err);
    res.status(500).json({ success: false, message: "Failed to load service" });
  }
});

export default router;

/**
 * GET /api/services/:id/stages/:stageId/documents
 * List required documents for a single service stage.
 */
router.get("/:id/stages/:stageId/documents", async (req, res) => {
  try {
    const { id, stageId } = req.params;

    // Verify service exists and is active
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Verify stage belongs to service
    const stage = await prisma.serviceStage.findUnique({
      where: { id: stageId },
      include: { service: { select: { id: true } } },
    });
    if (!stage || stage.service.id !== id) {
      return res.status(404).json({ success: false, message: "Stage not found for this service" });
    }

    const docs = await prisma.requiredDocument.findMany({
      where: { stageId, isActive: true },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, serviceId: id, stageId, documents: docs });
  } catch (err) {
    console.error("[GET /api/services/:id/stages/:stageId/documents] error:", err);
    res.status(500).json({ success: false, message: "Failed to load required documents" });
  }
});
