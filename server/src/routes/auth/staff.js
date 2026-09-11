import { Router } from "express";
import bcrypt from "bcrypt";
import {
  storeOTP,
  verifyOTP,
  deleteOTP,
  isOTPExpired,
} from "../../services/auth/otpStore.js";
import { generateOTP, deliverOTPToConsole } from "../../services/auth/otp.js";
import { signToken } from "../../services/auth/jwt.js";
import { prisma } from "../../db.js";
import { Role } from "../../generated/prisma/index.js";

const router = Router();

/**
 * POST /api/auth/staff/register
 * Registers a new staff user with email + password (bcrypt-hashed).
 * Body: { name, email, password, employeeId? }
 */
router.post("/register", async (req, res) => {
  const { name, email, password, employeeId, officeId } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Name, email, and password are required",
      });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 8 characters",
      });
  }

  const existingEmail = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });
  if (existingEmail) {
    return res
      .status(409)
      .json({ success: false, message: "User with this email already exists" });
  }

  if (employeeId) {
    const existingEmployee = await prisma.user.findFirst({
      where: { employeeId },
    });
    if (existingEmployee) {
      return res
        .status(409)
        .json({ success: false, message: "Employee ID is already in use" });
    }
  }

  if (!officeId) {
    return res.status(400).json({ success: false, message: "Government office is required" });
  }

  const office = await prisma.governmentOffice.findUnique({ where: { id: officeId, isActive: true } });
  if (!office) {
    return res.status(400).json({ success: false, message: "Invalid government office" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const now = new Date();

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        passwordChangedAt: now,
        employeeId,
        role: Role.STAFF,
        officeId,
      },
    });
  } catch (err) {
    // Safety net for any other unique-constraint we might add later.
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target;
      return res
        .status(409)
        .json({
          success: false,
          message: target
            ? `A user with this ${target} already exists`
            : "A user with these details already exists",
        });
    }
    throw err;
  }

  console.log(`[Staff Registered] Email: ${user.email}, ID: ${user.id}`);

  res.status(201).json({
    success: true,
    message: "Staff account created successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      officeId: user.officeId,
      office: office ? { id: office.id, nameEn: office.nameEn, nameNe: office.nameNe } : null,
    },
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
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const passwordOk = user.password
    ? await bcrypt.compare(password, user.password)
    : false;
  if (!passwordOk) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  if (user.role !== Role.STAFF && user.role !== Role.ADMIN) {
    return res
      .status(403)
      .json({ success: false, message: "Not a staff account" });
  }

  if (!user.email) {
    return res
      .status(400)
      .json({ success: false, message: "Account has no email on file" });
  }

  const otp = generateOTP(6);
  storeOTP(`staff_${user.email}`, otp);
  deliverOTPToConsole(user.email, otp);

  res
    .status(200)
    .json({
      success: true,
      message: "OTP sent to console for 2FA verification",
    });
});

/**
 * POST /api/auth/staff/verify-otp
 * Verifies staff 2FA OTP and returns a token.
 * Body: { email, otp }
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  const key = `staff_${email.toLowerCase()}`;
  if (isOTPExpired(key)) {
    return res
      .status(401)
      .json({ success: false, message: "OTP expired, please log in again" });
  }

  if (!verifyOTP(key, otp)) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  deleteOTP(key);

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  // Update lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Sign a JWT for the staff user
  const token = signToken({
    sub: user.id,
    role: user.role,
    lang: user.preferredLanguage,
    pwd: user.passwordChangedAt ? user.passwordChangedAt.getTime() : null,
  });

  res.status(200).json({
    success: true,
    message: "Staff login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      officeId: user.officeId,
      office: user.officeId ? await prisma.governmentOffice.findUnique({ where: { id: user.officeId }, select: { id: true, nameEn: true, nameNe: true, location: true } }) : null,
      type: "staff",
    },
  });
});

export default router;
