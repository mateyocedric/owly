import React, { memo } from "react";
import {
  CHAT_REACTION_BY_ID,
  CHAT_REACTION_IDS,
  type ChatReactionId,
} from "@owly/shared";

const reactionButtonClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-white/30 bg-black/50 text-base leading-none text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40";

interface ReactionBarProps {
  disabled?: boolean;
  onReact: (id: ChatReactionId) => void;
}

export const ReactionBar = memo(function ReactionBar({
  disabled = false,
  onReact,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Reactions">
      {CHAT_REACTION_IDS.map((id) => {
        const { emoji, label } = CHAT_REACTION_BY_ID[id];
        return (
          <button
            key={id}
            type="button"
            className={reactionButtonClass}
            disabled={disabled}
            aria-label={label}
            title={label}
            onClick={(event) => {
              event.stopPropagation();
              onReact(id);
            }}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        );
      })}
    </div>
  );
});
