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
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-sm text-zinc-400">
          <p>Connecting you to a partner... Be respectful and follow community guidelines.</p>
        </div>
      )}

      {messages.map((msg) => {
        if (msg.sender === "system") {
          return (
            <div key={msg.id} className="flex justify-center my-2">
              <div className="rounded-lg bg-zinc-900/80 border border-zinc-800/80 px-3 py-1.5 text-xs text-zinc-400 max-w-md text-center leading-relaxed">
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
            <span className="text-[10px] font-semibold text-zinc-400 mb-1 px-1">
              {isSelf ? "You" : "Stranger"}
            </span>
            <div
              className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words ${
                isSelf
                  ? "bg-violet-600 text-white rounded-br-none"
                  : "bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[9px] text-zinc-400 mt-1 px-1">
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
