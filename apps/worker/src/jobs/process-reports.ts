import { ModerationReport, AnonymousSession } from "@owly/database";

export async function autoFlagSuspiciousReports() {
  // Automatically escalate pending reports if reported user has multiple recent pending reports
  const pendingReports = await ModerationReport.find({ status: "pending" });

  const countByTarget = new Map<string, number>();
  for (const rep of pendingReports) {
    const targetId = rep.reportedSessionId.toString();
    countByTarget.set(targetId, (countByTarget.get(targetId) || 0) + 1);
  }

  for (const [targetId, count] of countByTarget.entries()) {
    if (count >= 3) {
      console.log(`⚠️ User ${targetId} flagged for multiple reports (${count})`);
      // Update session status to warned if still active
      await AnonymousSession.updateOne(
        { _id: targetId, status: "active" },
        { status: "warned" }
      );
    }
  }
}
