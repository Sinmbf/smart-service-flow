import express from "express";
import helmet from "helmet";
import cors from "cors";
import citizenAuthRoutes from "./routes/auth/citizen";
import staffAuthRoutes from "./routes/auth/staff";

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

export default app;