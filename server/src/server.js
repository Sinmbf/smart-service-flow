import "dotenv/config";
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
    console.log("─────────────────────────────────────────────");
  });
}

start();
