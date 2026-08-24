import express from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())

app.get("/api/health",(_req,res)=>{
    res.status(200).json({
        success: true,
        message: "API is running"
    })
})

export default app;