// In-memory OTP store (replace with Redis/DB in production)
interface StoredOTP {
  code: string;
  expiresAt: number;
  phoneNumber: string;
  attempts: number;
}

const otpStore = new Map<string, StoredOTP>();
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const MAX_ATTEMPTS = 3;

export function storeOTP(phoneNumber: string, code: string): void {
  otpStore.set(phoneNumber, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_SECONDS * 1000,
    phoneNumber,
    attempts: 0,
  });
}

export function verifyOTP(phoneNumber: string, code: string): boolean {
  const record = otpStore.get(phoneNumber);
  if (!record) return false;

  // Check expiry
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phoneNumber);
    return false;
  }

  // Check attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phoneNumber);
    return false;
  }

  record.attempts += 1;
  return record.code === code;
}

export function deleteOTP(phoneNumber: string): void {
  otpStore.delete(phoneNumber);
}

export function isOTPExpired(phoneNumber: string): boolean {
  const record = otpStore.get(phoneNumber);
  if (!record) return true;
  return Date.now() > record.expiresAt;
}

export function getOTPStore(): Map<string, StoredOTP> {
  return otpStore;
}