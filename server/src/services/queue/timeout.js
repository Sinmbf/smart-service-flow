// No-show sweeper: every `NO_SHOW_SWEEP_MS` milliseconds, flip any
// GENERATED token older than `NO_SHOW_MINUTES` to EXPIRED. Started by
// the server entry point; idempotent (running twice just runs the
// sweeper twice as fast).

import { prisma } from "../../db.js";

const DEFAULT_INTERVAL_MS = 60_000; // every minute
let handle = null;
let intervalMs = DEFAULT_INTERVAL_MS;

function setIntervalMs(value) {
  intervalMs = value;
}

function getIntervalMs() {
  return intervalMs;
}

async function sweepNoShows({ now = new Date() } = {}) {
  // Configurable grace per file policy (counter-level check-in); default 3m
  const minutes = Number(process.env.NO_SHOW_MINUTES || 3);
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;

  const cutoff = new Date(now.getTime() - minutes * 60_000);
  try {
    const { count } = await prisma.token.updateMany({
      where: {
        status: "GENERATED",
        generatedAt: { lt: cutoff },
      },
      data: { status: "SKIPPED" },
    });
    if (count > 0) {
      console.log(`[queue/timeout] expired ${count} no-show token(s)`);
    }
    return count;
  } catch (err) {
    console.error("[queue/timeout] sweep failed:", err);
    return 0;
  }
}

export function startNoShowSweeper() {
  if (handle) return; // already running
  // Kick off once, then on interval
  sweepNoShows();
  handle = setInterval(() => {
    sweepNoShows();
  }, intervalMs);
  handle.unref?.(); // don't keep the process alive for the timer
  console.log(`[queue/timeout] started (interval ${intervalMs}ms)`);
}

export function stopNoShowSweeper() {
  if (handle) {
    clearInterval(handle);
    handle = null;
  }
}

export { setIntervalMs, getIntervalMs, sweepNoShows };
// ponytail: no-show grace sweep per policy
