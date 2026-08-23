import React from "react";
import { Loader2, X } from "lucide-react";
import { GhostButton } from "../design/index.js";

interface WaitingScreenProps {
  position?: number | null;
  interests?: string[];
  onCancel: () => void;
}

export function WaitingScreen({
  position,
  interests = [],
  onCancel,
}: WaitingScreenProps) {
  return (
    <div className="mx-auto my-auto flex max-w-md flex-col items-center justify-center space-y-6 p-8 text-center">
      <Loader2 className="size-10 animate-spin text-[var(--sx-on-primary-mute)]" />

      <div className="space-y-2">
        <h3 className="sx-panel-title">Finding someone for you</h3>
        <p className="sx-caption">
          Looking for active users online.
          {interests.length > 0
            ? " Prioritizing people who share your topics."
            : " Matching randomly."}
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

      {position !== null && position !== undefined && (
        <p className="sx-caption">
          Queue position: <strong className="text-[var(--sx-on-primary)]">#{position}</strong>
        </p>
      )}

      <GhostButton onClick={onCancel}>
        <X className="size-4" />
        Cancel Matchmaking
      </GhostButton>
    </div>
  );
}
