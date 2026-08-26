// OTP generation utilities (console-only delivery — no SMS gateway)
export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// Console delivery — logs to server stdout for development/testing
export function deliverOTPToConsole(phoneNumber: string, code: string): void {
  console.log(`
┌─────────────────────────────────────┐
│  OTP DELIVERY (Console Mode)        │
│  Phone: ${phoneNumber.padEnd(20)}    │
│  Code:   ${code.padEnd(20)}          │
│  (In production: send via SMS)       │
└─────────────────────────────────────┘
`);
}