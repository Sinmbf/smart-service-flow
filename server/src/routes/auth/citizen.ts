import { Router } from "express";
import type { Request, Response } from "express";
import { generateOTP, deliverOTPToConsole } from "../../services/auth/otp";
import { storeOTP, verifyOTP, deleteOTP, isOTPExpired } from "../../services/auth/otpStore";
import { prisma } from "../../db";
import { Role, Language } from "../../generated/prisma/enums";

const router = Router();

/**
 * POST /api/auth/citizen/send-otp
 * Sends (console-logs) an OTP to the given phone number.
 * Body: { phoneNumber: string }
 */
router.post("/send-otp", async (req: Request, res: Response) => {
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
 * Verifies the OTP, upserts a Citizen user, and returns a base64 token.
 * (Step 2 will replace the base64 token with a real JWT.)
 * Body: { phoneNumber: string, otp: string }
 */
router.post("/verify", async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
  }

  const normalized = phoneNumber.replace(/\s/g, "");

  if (isOTPExpired(normalized)) {
    return res.status(401).json({ success: false, message: "OTP expired, please request a new one" });
  }

  if (!verifyOTP(normalized, otp)) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  // Upsert the citizen in DB (creates on first login)
  const user = await prisma.user.upsert({
    where: { phoneNumber: normalized },
    update: {},
    create: {
      phoneNumber: normalized,
      role: Role.CITIZEN,
      preferredLanguage: Language.EN,
    },
  });

  console.log(`[Citizen Auth] Phone: ${user.phoneNumber}, ID: ${user.id}`);

  // Clean up OTP
  deleteOTP(normalized);

  // Placeholder token (Step 2 will replace with JWT)
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

  res.status(200).json({
    success: true,
    message: "Verification successful",
    token,
    user: {
      id: user.id,
      type: "citizen",
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
    },
  });
});

export default router;
