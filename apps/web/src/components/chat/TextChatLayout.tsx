import React from "react";
import {
  ReactionBurstOverlay,
  type ReactionBurst,
} from "./ReactionBurstOverlay.js";

interface TextChatLayoutProps {
  chrome: React.ReactNode;
  messages: React.ReactNode;
  input: React.ReactNode;
  reactions?: React.ReactNode;
  reactionBursts?: ReactionBurst[];
  onReactionBurstEnd?: (id: string) => void;
}

/** Full-height text-only chat: status/controls on top, messages + input below. */
export function TextChatLayout({
  chrome,
  messages,
  input,
  reactions,
  reactionBursts = [],
  onReactionBurstEnd,
}: TextChatLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[var(--sx-canvas-night-soft)]">
      <div className="shrink-0 border-b border-[var(--sx-hairline-on-dark)] pt-[max(0.5rem,env(safe-area-inset-top))]">
        {chrome}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {messages}
          <ReactionBurstOverlay
            bursts={reactionBursts}
            onBurstEnd={onReactionBurstEnd ?? (() => {})}
          />
        </div>
        <div className="mt-auto shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {reactions ? (
            <div className="flex justify-center px-3 pb-1.5">{reactions}</div>
          ) : null}
          {input}
        </div>
      </div>
    </div>
  );
}
