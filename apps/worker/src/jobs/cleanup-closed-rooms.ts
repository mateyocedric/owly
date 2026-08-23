import { ChatRoom } from "@owly/database";

export async function cleanupOldRooms() {
  // Purge closed rooms older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const result = await ChatRoom.deleteMany({
    status: "closed",
    closedAt: { $lt: thirtyDaysAgo },
  });
  if (result.deletedCount > 0) {
    console.log(`🧹 Cleaned up ${result.deletedCount} old closed chat rooms`);
  }
}
