import { connectDB } from "@owly/database";
import { cleanupExpiredSessions } from "./jobs/cleanup-expired-sessions.js";
import { cleanupOldRooms } from "./jobs/cleanup-closed-rooms.js";
import { autoFlagSuspiciousReports } from "./jobs/process-reports.js";

console.log("⚙️  Owly worker starting...");

await connectDB();
console.log("✅ Worker connected to database");

async function runJobs() {
  try {
    await cleanupExpiredSessions();
    await cleanupOldRooms();
    await autoFlagSuspiciousReports();
  } catch (err) {
    console.error("Worker error during job execution:", err);
  }
}

// Run immediately on boot
await runJobs();

// Run every 5 minutes
const INTERVAL = 5 * 60 * 1000;
setInterval(runJobs, INTERVAL);

console.log(`🚀 Owly background worker is running (interval: ${INTERVAL / 1000}s)`);
