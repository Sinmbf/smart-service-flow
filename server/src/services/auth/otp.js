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
 * Console delivery — prints the OTP to the server's live stdout (so it shows
 * up in whichever terminal started the server) AND appends a one-liner to
 * `server/otp.log` so it survives if the foreground terminal is closed.
 *
 * The terminal-friendly box format mirrors the original behaviour that
 * developers were used to:
 *
 *   ┌─────────────────────────────────────┐
 *   │  OTP DELIVERY (Console Mode)        │
 *   │  Target: +9779841234567             │
 *   │  Code:   574907                     │
 *   │  (In production: send via SMS)       │
 *   └─────────────────────────────────────┘
 *
 * The log file gets a simpler one-liner so it can be `grep`ed or `tail`ed:
 *
 *   [OTP]  2026-09-05 14:32:11  +9779841234567  →  574907
 *
 * In production, replace this with an SMS gateway integration.
 */
export function deliverOTPToConsole(target, code) {
  const targetStr = String(target).padEnd(20);
  const codeStr = String(code).padEnd(20);

  // 1. Pretty multi-line box on stdout (works in both TTY and non-TTY stdout)
  const box = [
    "",
    "┌─────────────────────────────────────┐",
    "│  OTP DELIVERY (Console Mode)        │",
    `│  Target: ${targetStr}    │`,
    `│  Code:   ${codeStr}          │`,
    "│  (In production: send via SMS)       │",
    "└─────────────────────────────────────┘",
    "",
  ].join("\n");
  console.log(box);

  // 2. Single-line append to a fixed log file at server/otp.log (grep-friendly)
  try {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const logFile = path.join(process.cwd(), "otp.log");
    fs.appendFileSync(logFile, `[OTP]  ${timestamp}  ${target}  →  ${code}\n`);
  } catch (err) {
    // File logging is best-effort; never break the request because of a log error
    console.warn(`[OTP]  (could not write to otp.log: ${err.message})`);
  }
}
