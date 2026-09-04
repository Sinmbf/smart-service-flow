import { Router } from "express";
import { storeOTP, verifyOTP, deleteOTP, isOTPExpired } from "../../services/auth/otpStore.js";
import { generateOTP, deliverOTPToConsole } from "../../services/auth/otp.js";
import { prisma } from "../../db.js";
import { Role } from "../../generated/prisma/index.js";

const router = Router();

/**
 * POST /api/auth/staff/register
 * Registers a new staff user with email + password (plaintext for now — bcrypt in Step 2).
 * Body: { name, email, password, employeeId? }
 */
router.post("/register", async (req, res) => {
  const { name, email, password, employeeId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const existing = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ success: false, message: "User with this email already exists" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password, // TODO Step 2: bcrypt
      employeeId,
      role: Role.STAFF,
    },
  });

  console.log(`[Staff Registered] Email: ${user.email}, ID: ${user.id}`);

  res.status(201).json({
    success: true,
    message: "Staff account created successfully",
    user: { id: user.id, name: user.name, email: user.email, employeeId: user.employeeId, role: user.role },
  });
});

/**
 * POST /api/auth/staff/login
 * Logs in with email + password, then triggers 2FA OTP.
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // TODO Step 2: bcrypt.compare
  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (user.role !== Role.STAFF && user.role !== Role.ADMIN) {
    return res.status(403).json({ success: false, message: "Not a staff account" });
  }

  if (!user.email) {
    return res.status(400).json({ success: false, message: "Account has no email on file" });
  }

  const otp = generateOTP(6);
  storeOTP(`staff_${user.email}`, otp);
  deliverOTPToConsole(user.email, otp);

  res.status(200).json({ success: true, message: "OTP sent to console for 2FA verification" });
});

/**
 * POST /api/auth/staff/verify-otp
 * Verifies staff 2FA OTP and returns a token.
 * Body: { email, otp }
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const key = `staff_${email.toLowerCase()}`;
  if (isOTPExpired(key)) {
    return res.status(401).json({ success: false, message: "OTP expired, please log in again" });
  }

  if (!verifyOTP(key, otp)) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  deleteOTP(key);

  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  // Placeholder token (Step 2 will replace with JWT)
  const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64");

  res.status(200).json({
    success: true,
    message: "Staff login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email, employeeId: user.employeeId, role: user.role, type: "staff" },
  });
});

export default router;
