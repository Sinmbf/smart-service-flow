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
  const line = `[OTP]  ${timestamp}  ${target}  →  ${code}\n`;

  // 1. Write directly to stdout (avoids any console.log buffering in non-TTY environments
  //    like IDE run consoles or background processes where console.log can be delayed).
  process.stdout.write(line);

  // 2. Same line appended to a fixed log file at server/otp.log
  try {
    const logFile = path.join(process.cwd(), "otp.log");
    fs.appendFileSync(logFile, line);
  } catch (err) {
    // File logging is best-effort; never break the request because of a log error
    process.stdout.write(`[OTP]  (could not write to otp.log: ${err.message})\n`);
  }
}
