import "dotenv/config";
import app from "./app.js";
import { checkDatabaseConnection } from "./dbCheck.js";
import { startNoShowSweeper, stopNoShowSweeper } from "./services/queue/timeout.js";

const PORT = process.env.PORT || 5000;

async function start() {
  console.log("🚀 Starting Smart Service Flow API...");
  console.log("─────────────────────────────────────────────");

  const db = await checkDatabaseConnection();
  if (!db.ok) {
    console.error("Aborting startup: database is not reachable.");
    process.exit(1);
  }

  startNoShowSweeper();

  app.listen(PORT, () => {
    console.log("─────────────────────────────────────────────");
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log("─────────────────────────────────────────────");
  });
}

function shutdown() {
  stopNoShowSweeper();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
