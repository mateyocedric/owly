import { X } from "lucide-react";
import { OwlyLogo } from "../brand/OwlyLogo.js";
import { GhostButton } from "../design/index.js";

interface WaitingScreenProps {
  interests?: string[];
  onlineCount?: number | null;
  onCancel: () => void;
}

export function WaitingScreen({
  interests = [],
  onlineCount = null,
  onCancel,
}: WaitingScreenProps) {
  const onlineLabel =
    onlineCount != null
      ? `${onlineCount.toLocaleString()} people online. Matching randomly.`
      : "Looking for active users online. Matching randomly.";

  return (
    <div className="mx-auto my-auto flex max-w-md flex-col items-center justify-center space-y-6 p-8 text-center">
      <OwlyLogo size="md" alt="" />

      <div className="space-y-2">
        <h3 className="sx-panel-title">
          Finding someone for you
          <span className="sx-loading-dots" aria-hidden="true" />
        </h3>
        <p className="sx-caption">
          {interests.length > 0
            ? "Looking for someone who shares your topics. If no one matches, you'll be paired randomly in a few seconds."
            : onlineLabel}
        </p>
      </div>

      {interests.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="sx-caption uppercase tracking-wider">Topics:</span>
          {interests.map((interest) => (
            <span key={interest} className="sx-chip">
              #{interest}
            </span>
          ))}
        </div>
      )}

      <GhostButton onClick={onCancel}>
        <X className="size-4" />
        Cancel Matchmaking
      </GhostButton>
    </div>
  );
}
