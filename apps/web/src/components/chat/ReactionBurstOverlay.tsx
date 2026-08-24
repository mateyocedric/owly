import React, { memo } from "react";
import type { ChatReactionEmoji } from "@owly/shared";

export interface ReactionBurst {
  id: string;
  emoji: ChatReactionEmoji;
  from: "self" | "partner";
  /** Horizontal start position as a percentage of the overlay width (0–100). */
  x: number;
  /** Horizontal drift in pixels during the float animation. */
  drift: number;
}

interface ReactionBurstOverlayProps {
  bursts: ReactionBurst[];
  onBurstEnd: (id: string) => void;
}

export const ReactionBurstOverlay = memo(function ReactionBurstOverlay({
  bursts,
  onBurstEnd,
}: ReactionBurstOverlayProps) {
  if (bursts.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[12] overflow-hidden"
      aria-hidden="true"
    >
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="owly-reaction-burst absolute bottom-[28%] text-4xl drop-shadow-md sm:text-5xl"
          style={
            {
              left: `${burst.x}%`,
              "--owly-reaction-drift": `${burst.drift}px`,
            } as React.CSSProperties
          }
          onAnimationEnd={() => onBurstEnd(burst.id)}
        >
          {burst.emoji}
        </span>
      ))}
    </div>
  );
});
