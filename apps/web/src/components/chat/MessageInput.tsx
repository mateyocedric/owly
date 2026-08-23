import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@owly/ui";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  cooldownSeconds?: number;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled,
  cooldownSeconds = 0,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isCoolingDown = cooldownSeconds > 0;
  const cannotSend = Boolean(disabled || isCoolingDown);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || cannotSend) return;
    onSend(text.trim());
    setText("");
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!isCoolingDown) onTyping();
  };

  const placeholder = disabled
    ? "Waiting for partner..."
    : isCoolingDown
      ? `Wait ${cooldownSeconds}s before sending...`
      : "Type your message here...";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 bg-zinc-950 border-t border-zinc-800"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={2000}
        className="flex-1 h-12 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-4 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 transition-all"
      />
      <Button
        type="submit"
        disabled={!text.trim() || cannotSend}
        size="lg"
        className="h-12 px-5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white shadow-lg shadow-violet-600/20 min-w-[5.5rem]"
      >
        {isCoolingDown ? (
          <span>{cooldownSeconds}s</span>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Send</span>
          </>
        )}
      </Button>
    </form>
  );
}
