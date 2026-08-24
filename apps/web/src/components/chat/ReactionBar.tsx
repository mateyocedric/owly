import React, { memo } from "react";
import { CHAT_REACTIONS, type ChatReactionEmoji } from "@owly/shared";

const REACTION_LABELS: Record<ChatReactionEmoji, string> = {
  "👍": "Thumbs up",
  "❤️": "Heart",
  "😂": "Laugh",
  "😮": "Surprised",
  "😢": "Sad",
  "🔥": "Fire",
};

const reactionButtonClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-white/30 bg-black/50 text-base leading-none text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40";

interface ReactionBarProps {
  disabled?: boolean;
  onReact: (emoji: ChatReactionEmoji) => void;
}

export const ReactionBar = memo(function ReactionBar({
  disabled = false,
  onReact,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Reactions">
      {CHAT_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={reactionButtonClass}
          disabled={disabled}
          aria-label={REACTION_LABELS[emoji]}
          title={REACTION_LABELS[emoji]}
          onClick={(event) => {
            event.stopPropagation();
            onReact(emoji);
          }}
        >
          <span aria-hidden="true">{emoji}</span>
        </button>
      ))}
    </div>
  );
});
