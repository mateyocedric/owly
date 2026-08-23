import { UserBlock } from "@owly/database";
import mongoose from "mongoose";

export async function blockUser(
  blockerSessionId: string,
  blockedSessionId: string
) {
  if (blockerSessionId === blockedSessionId) return;

  await UserBlock.updateOne(
    {
      blockerSessionId: new mongoose.Types.ObjectId(blockerSessionId),
      blockedSessionId: new mongoose.Types.ObjectId(blockedSessionId),
    },
    {
      blockerSessionId: new mongoose.Types.ObjectId(blockerSessionId),
      blockedSessionId: new mongoose.Types.ObjectId(blockedSessionId),
    },
    { upsert: true }
  );
}

export async function isBlocked(
  session1: string,
  session2: string
): Promise<boolean> {
  const count = await UserBlock.countDocuments({
    $or: [
      {
        blockerSessionId: new mongoose.Types.ObjectId(session1),
        blockedSessionId: new mongoose.Types.ObjectId(session2),
      },
      {
        blockerSessionId: new mongoose.Types.ObjectId(session2),
        blockedSessionId: new mongoose.Types.ObjectId(session1),
      },
    ],
  });

  return count > 0;
}
