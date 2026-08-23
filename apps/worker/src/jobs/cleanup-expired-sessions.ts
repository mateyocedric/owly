import { AnonymousSession } from "@owly/database";

export async function cleanupExpiredSessions() {
  const result = await AnonymousSession.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  if (result.deletedCount > 0) {
    console.log(`🧹 Cleaned up ${result.deletedCount} expired anonymous sessions`);
  }
}
