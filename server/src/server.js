import "dotenv/config";
import path from "node:path";
import app from "./app.js";
import { checkDatabaseConnection } from "./dbCheck.js";

const PORT = process.env.PORT || 5000;

async function start() {
  console.log("🚀 Starting Smart Service Flow API...");
  console.log("─────────────────────────────────────────────");

  const db = await checkDatabaseConnection();
  if (!db.ok) {
    console.error("Aborting startup: database is not reachable.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log("─────────────────────────────────────────────");
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log("");
    console.log("📨 OTP codes will be printed below AND saved to:");
    console.log(`   ${path.join(process.cwd(), "otp.log")}`);
    console.log("   (Run `Get-Content otp.log -Wait` in another terminal to tail it.)");
    console.log("─────────────────────────────────────────────");
  });
}

start();
