/**
 * Admin / debug endpoints used for verifying the seed and DB shape during Step 1.
 * Removed once a real admin dashboard exists (Step 19).
 */
import { Router } from "express";
import { prisma } from "../../db.js";
const router = Router();
router.get("/seed-check", async (_req, res) => {
    const [offices, services, stages, documents, users] = await Promise.all([
        prisma.governmentOffice.count(),
        prisma.service.count(),
        prisma.serviceStage.count(),
        prisma.requiredDocument.count(),
        prisma.user.count(),
    ]);
    res.json({ success: true, counts: { offices, services, stages, documents, users } });
});
router.get("/services", async (_req, res) => {
    const services = await prisma.service.findMany({
        select: { id: true, nameEn, nameNe, category, office: { select: { nameEn: true } } },
    });
    res.json({ success: true, services });
});
export default router;
