import React, { useEffect, useRef } from "react";
import type { ChatMessage } from "@owly/shared";
import { TypingIndicator } from "./TypingIndicator.js";

interface MessageListProps {
  messages: ChatMessage[];
  partnerTyping: boolean;
}

export function MessageList({ messages, partnerTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-center">
          <p className="sx-caption max-w-sm">
            Connecting you to a partner... Be respectful and follow community guidelines.
          </p>
        </div>
      )}

      {messages.map((msg) => {
        if (msg.sender === "system") {
          return (
            <div key={msg.id} className="my-2 flex justify-center">
              <div className="max-w-md border border-[var(--sx-hairline-on-dark)] px-3 py-1.5 text-center sx-caption leading-relaxed">
                {msg.content}
              </div>
            </div>
          );
        }

        const isSelf = msg.sender === "self";

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
          >
            <span className="mb-1 px-1 sx-caption uppercase tracking-wider">
              {isSelf ? "You" : "Stranger"}
            </span>
            <div
              className={`max-w-[85%] break-words rounded-sm px-4 py-2.5 text-sm leading-relaxed sm:max-w-md ${
                isSelf
                  ? "bg-[var(--sx-on-primary)] text-[var(--sx-ink)]"
                  : "border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night-soft)] text-[var(--sx-on-primary)]"
              }`}
            >
              {msg.content}
            </div>
            <span className="mt-1 px-1 text-[10px] text-[var(--sx-on-primary-mute)]">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}

      {partnerTyping && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
