// OTP generation utilities (console-only delivery — no SMS gateway)
import fs from "node:fs";
import path from "node:path";

export function generateOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Console delivery — prints the OTP to the server stdout AND appends it to
 * `server/otp.log` so it survives if the foreground terminal is closed.
 * The log line format is plain and easy to copy:
 *
 *   [2026-09-05 14:32:11]  OTP for +9779841234567  →  574907
 *
 * In production, replace this with an SMS gateway integration.
 */
export function deliverOTPToConsole(target, code) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

  // 1. Plain single-line log to stdout (easy to spot in any terminal)
  console.log(`[OTP]  ${timestamp}  ${target}  →  ${code}`);

  // 2. Same line appended to a fixed log file at server/otp.log
  try {
    const logFile = path.join(process.cwd(), "otp.log");
    fs.appendFileSync(logFile, `[OTP]  ${timestamp}  ${target}  →  ${code}\n`);
  } catch (err) {
    // File logging is best-effort; never break the request because of a log error
    console.warn(`[OTP]  (could not write to otp.log: ${err.message})`);
  }
}
