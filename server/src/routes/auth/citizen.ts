import { Router } from "express";
import type { Request, Response } from "express";
import { generateOTP, deliverOTPToConsole } from "../../services/auth/otp";
import { storeOTP, verifyOTP, deleteOTP, isOTPExpired } from "../../services/auth/otpStore";

const router = Router();

// In-memory "users" for demo — replace with DB in production
const users: Map<string, { phoneNumber: string; name?: string }> = new Map();

/**
 * POST /api/auth/citizen/send-otp
 * Sends (console-logs) an OTP to the given phone number.
 * Body: { phoneNumber: string }
 */
router.post("/send-otp", (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || typeof phoneNumber !== "string") {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  // Basic Nepal phone validation
  const normalized = phoneNumber.replace(/\s/g, "");
  if (!/^(\+977)?9[6-9]\d{8}$/.test(normalized)) {
    return res.status(400).json({ success: false, message: "Invalid phone number format" });
  }

  const code = generateOTP(6);
  storeOTP(normalized, code);
  deliverOTPToConsole(normalized, code);

  res.status(200).json({
    success: true,
    message: "OTP sent to console (development mode)",
    // NOTE: Do NOT return the OTP in response for security
  });
});

/**
 * POST /api/auth/citizen/verify
 * Verifies the OTP and returns a token (creates user if new).
 * Body: { phoneNumber: string, otp: string }
 */
router.post("/verify", (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
  }

  const normalized = phoneNumber.replace(/\s/g, "");

  // Check if OTP is expired
  if (isOTPExpired(normalized)) {
    return res.status(401).json({ success: false, message: "OTP expired, please request a new one" });
  }

  // Verify OTP
  if (!verifyOTP(normalized, otp)) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  // Create or retrieve user
  let user = users.get(normalized);
  if (!user) {
    user = { phoneNumber: normalized };
    users.set(normalized, user);
    console.log(`[User Registered] Phone: ${normalized}`);
  }

  // Clean up OTP
  deleteOTP(normalized);

  // Generate a simple token (in production, use JWT with proper signing)
  const token = Buffer.from(`${user.phoneNumber}:${Date.now()}`).toString("base64");

  res.status(200).json({
    success: true,
    message: "Verification successful",
    token,
    user: {
      type: "citizen",
      phoneNumber: user.phoneNumber,
      name: user.name,
    },
  });
});

export default router;