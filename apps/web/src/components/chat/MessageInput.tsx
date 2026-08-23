import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button, Input } from "@owly/ui";

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
      className="sx-light-surface !rounded-none !border-0 !border-t border-t-[var(--sx-hairline-on-light)] !p-3"
    >
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={2000}
          className="flex-1"
        />
        <Button type="submit" disabled={!text.trim() || cannotSend} size="default">
          {isCoolingDown ? (
            <span>{cooldownSeconds}s</span>
          ) : (
            <>
              <Send className="size-4" />
              <span className="ml-1 hidden sm:inline">Send</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
