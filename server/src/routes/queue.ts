import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// In-memory queue store for demo — replace with DB in production
interface ServiceQueue {
  id: string;
  name: string;
  currentNumber: number;
  lastNumber: number;
  waiting: number;
  estimatedWaitMinutes: number;
}

const services: ServiceQueue[] = [
  { id: "citizenship", name: "Citizenship", currentNumber: 12, lastNumber: 45, waiting: 33, estimatedWaitMinutes: 45 },
  { id: "passport", name: "Passport", currentNumber: 7, lastNumber: 28, waiting: 21, estimatedWaitMinutes: 28 },
  { id: "landRegistry", name: "Land Registry", currentNumber: 3, lastNumber: 15, waiting: 12, estimatedWaitMinutes: 18 },
  { id: "permits", name: "Business Permits", currentNumber: 19, lastNumber: 52, waiting: 33, estimatedWaitMinutes: 55 },
  { id: "taxClearance", name: "Tax Clearance", currentNumber: 5, lastNumber: 20, waiting: 15, estimatedWaitMinutes: 20 },
  { id: "birthCertificate", name: "Birth Certificate", currentNumber: 1, lastNumber: 8, waiting: 7, estimatedWaitMinutes: 10 },
];

/**
 * GET /api/queue/status
 * Returns the current queue status for all services.
 */
router.get("/status", (_req: Request, res: Response) => {
  // Simulate slight live variation in numbers
  const liveServices = services.map((s) => ({
    ...s,
    currentNumber: s.currentNumber + Math.floor(Math.random() * 2),
    lastNumber: s.lastNumber + Math.floor(Math.random() * 3),
    waiting: Math.max(0, s.waiting + Math.floor(Math.random() * 4) - 2),
  }));

  res.status(200).json({
    success: true,
    services: liveServices,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/queue/services
 * Returns the list of available services.
 */
router.get("/services", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    services: services.map(({ id, name }) => ({ id, name })),
  });
});

/**
 * GET /api/queue/:serviceId
 * Returns the queue status for a single service.
 */
router.get("/:serviceId", (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  res.status(200).json({
    success: true,
    service,
  });
});

export default router;
