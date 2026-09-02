import express from "express";
import helmet from "helmet";
import cors from "cors";
import citizenAuthRoutes from "./routes/auth/citizen.js";
import staffAuthRoutes from "./routes/auth/staff.js";
import queueRoutes from "./routes/queue.js";

const app = express();

app.use(helmet()); // For security headers

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running"
    });
});

// Authentication routes
app.use("/api/auth/citizen", citizenAuthRoutes);
app.use("/api/auth/staff", staffAuthRoutes);

// Queue routes
app.use("/api/queue", queueRoutes);

export default app;