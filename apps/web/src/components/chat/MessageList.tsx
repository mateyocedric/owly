import React, { memo, useEffect, useRef } from "react";
import type { ChatMessage } from "@owly/shared";
import { TypingIndicator } from "./TypingIndicator.js";

interface MessageListProps {
  messages: ChatMessage[];
  partnerTyping: boolean;
}

const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.sender === "system") {
    return (
      <div className="my-2 flex justify-center">
        <div className="max-w-md rounded-sm border border-white/20 bg-black/40 px-3 py-1.5 text-center text-xs leading-relaxed text-white/80 backdrop-blur-sm lg:border-[var(--sx-hairline-on-dark)] lg:bg-transparent lg:sx-caption lg:text-[var(--sx-on-primary-mute)]">
          {msg.content}
        </div>
      </div>
    );
  }

  const isSelf = msg.sender === "self";

  return (
    <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
      <span className="mb-0.5 px-1 text-[10px] uppercase tracking-wider text-white/60 lg:mb-1 lg:sx-caption lg:text-[var(--sx-on-primary-mute)]">
        {isSelf ? "You" : "Stranger"}
      </span>
      <div
        className={`max-w-[85%] break-words rounded-sm px-3 py-2 text-sm leading-relaxed sm:max-w-md lg:px-4 lg:py-2.5 ${
          isSelf
            ? "bg-white/90 text-[var(--sx-ink)] backdrop-blur-sm lg:bg-[var(--sx-on-primary)] lg:text-[var(--sx-ink)]"
            : "bg-black/40 text-white backdrop-blur-sm lg:border lg:border-[var(--sx-hairline-on-dark)] lg:bg-[var(--sx-canvas-night-soft)] lg:text-[var(--sx-on-primary)]"
        }`}
      >
        {msg.content}
      </div>
      <span className="mt-0.5 px-1 text-[10px] text-white/50 lg:mt-1 lg:text-[var(--sx-on-primary-mute)]">
        {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
});

export const MessageList = memo(function MessageList({
  messages,
  partnerTyping,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, partnerTyping]);

  return (
    <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2 lg:space-y-3 lg:p-4">
      {messages.length === 0 && (
        <div className="flex min-h-[4rem] items-center justify-center text-center">
          <p className="max-w-sm text-xs text-white/70 lg:sx-caption lg:text-[var(--sx-on-primary-mute)]">
            Connecting you to a partner... Be respectful and follow community guidelines.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {partnerTyping && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
});
