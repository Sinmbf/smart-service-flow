import { Router } from "express";
import type { Request, Response } from "express";
import { storeOTP, verifyOTP, deleteOTP, isOTPExpired } from "../../services/auth/otpStore";
import { generateOTP, deliverOTPToConsole } from "../../services/auth/otp";

const router = Router();

// In-memory "users" for demo — replace with DB in production
interface StaffUser {
  id: string;
  email: string;
  password: string; // In production: use bcrypt hashing!
  name: string;
  employeeId?: string;
}

const staffUsers: Map<string, StaffUser> = new Map();

/**
 * POST /api/auth/staff/register
 * Registers a new staff user with email + password.
 * Body: { name, email, password, employeeId? }
 */
router.post("/register", (req: Request, res: Response) => {
  const { name, email, password, employeeId } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  // Email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  // Password strength (min 8 chars)
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  // Check if user already exists
  for (const existing of staffUsers.values()) {
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }
  }

  // Create user
  const id = `staff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user: StaffUser = { id, name, email: email.toLowerCase(), password, employeeId };
  staffUsers.set(id, user);

  console.log(`[Staff Registered] Email: ${user.email}, ID: ${user.id}`);

  res.status(201).json({
    success: true,
    message: "Staff account created successfully",
    user: { id: user.id, name: user.name, email: user.email, employeeId: user.employeeId },
  });
});

/**
 * POST /api/auth/staff/login
 * Logs in a staff user with email + password, returns a token.
 * Body: { email, password }
 */
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // Find user
  const user = Array.from(staffUsers.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Validate password (plaintext for demo — bcrypt in production)
  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // In production, send OTP to staff email for 2FA
  const otp = generateOTP(6);
  storeOTP(`staff_${user.email}`, otp);
  deliverOTPToConsole(user.email, otp);

  res.status(200).json({
    success: true,
    message: "OTP sent to console for 2FA verification",
  });
});

/**
 * POST /api/auth/staff/verify-otp
 * Verifies staff 2FA OTP after login.
 * Body: { email, otp }
 */
router.post("/verify-otp", (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  if (isOTPExpired(`staff_${email.toLowerCase()}`)) {
    return res.status(401).json({ success: false, message: "OTP expired, please log in again" });
  }

  if (!verifyOTP(`staff_${email.toLowerCase()}`, otp)) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  deleteOTP(`staff_${email.toLowerCase()}`);

  const user = Array.from(staffUsers.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  // In production, use JWT
  const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64");

  res.status(200).json({
    success: true,
    message: "Staff login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email, employeeId: user.employeeId, type: "staff" },
  });
});

export default router;