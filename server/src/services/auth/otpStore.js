const otpStore = new Map();
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const MAX_ATTEMPTS = 3;
export function storeOTP(phoneNumber, code) {
    otpStore.set(phoneNumber, {
        code,
        expiresAt: Date.now() + OTP_EXPIRY_SECONDS * 1000,
        phoneNumber,
        attempts: 0,
    });
}
export function verifyOTP(phoneNumber, code) {
    const record = otpStore.get(phoneNumber);
    if (!record)
        return false;
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
export function deleteOTP(phoneNumber) {
    otpStore.delete(phoneNumber);
}
export function isOTPExpired(phoneNumber) {
    const record = otpStore.get(phoneNumber);
    if (!record)
        return true;
    return Date.now() > record.expiresAt;
}
export function getOTPStore() {
    return otpStore;
}
