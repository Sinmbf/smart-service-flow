/**
 * Verifies the Postgres connection is healthy.
 * Runs a cheap `SELECT 1` and returns a structured result.
 * Called once at server startup so the connection status is visible in the console.
 */
import { prisma } from "./db.js";

export async function checkDatabaseConnection() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const ms = Date.now() - start;

    // Pull quick counts so the startup log is informative
    const [users, services, offices] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.governmentOffice.count(),
    ]);

    console.log(
      `✅ Connected to PostgreSQL (${ms}ms) — ${offices} offices, ${services} services, ${users} users`
    );
    return { ok: true, ms, counts: { offices, services, users } };
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:");
    console.error("   ", err.message);
    if (err.message.includes("ECONNREFUSED")) {
      console.error("   → Is PostgreSQL running on the host/port in DATABASE_URL?");
    } else if (err.message.includes("authentication")) {
      console.error("   → Check the username/password in DATABASE_URL");
    } else if (err.message.includes("does not exist")) {
      console.error("   → The database does not exist. Run: createdb -U postgres smart_service_flow");
    }
    return { ok: false, error: err.message };
  }
}
