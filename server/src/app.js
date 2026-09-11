import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import citizenAuthRoutes from "./routes/auth/citizen.js";
import staffAuthRoutes from "./routes/auth/staff.js";
import meRoutes from "./routes/auth/me.js";
import logoutRoutes from "./routes/auth/logout.js";
import queueRoutes from "./routes/queue.js";
import serviceRoutes from "./routes/services.js";
import tokenRoutes from "./routes/tokens.js";
import staffTokenRoutes from "./routes/staff/tokens.js";
import staffQueueRoutes from "./routes/staff/queue.js";
import notificationRoutes from "./routes/notifications.js";
import adminDebugRoutes from "./routes/admin/debug.js";
const app = express();
app.use(helmet()); // For security headers
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running"
    });
});
// Authentication routes
app.use("/api/auth/citizen", citizenAuthRoutes);
app.use("/api/auth/staff", staffAuthRoutes);
app.use("/api/auth/me", meRoutes);
app.use("/api/auth/logout", logoutRoutes);
// Service information routes
app.use("/api/services", serviceRoutes);
// Queue routes
app.use("/api/queue", queueRoutes);
// Token Flow routes (public, requires auth for mutation; reads public)
app.use("/api/tokens", tokenRoutes);
// Staff check-in + call/skip/recall/complete (STAFF/ADMIN only)
app.use("/api/staff/tokens", staffTokenRoutes);
// Staff per-stage queue board (STAFF/ADMIN only)
app.use("/api/staff/queues", staffQueueRoutes);
app.use("/api/notifications", notificationRoutes);
// Admin / debug routes (temporary, removed in Step 19)
app.use("/api/admin/_debug", adminDebugRoutes);
export default app;
