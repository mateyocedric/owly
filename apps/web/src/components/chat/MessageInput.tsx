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
      className="mx-3 rounded-sm border border-white/20 bg-black/50 p-2 backdrop-blur-md lg:mx-0 lg:rounded-none lg:border-0 lg:border-t lg:border-t-[var(--sx-hairline-on-dark)] lg:bg-transparent lg:p-3 lg:backdrop-blur-none"
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
          className="flex-1 border-white/20 bg-black/30 text-white placeholder:text-white/50 lg:border-[var(--sx-hairline-on-dark)] lg:bg-transparent lg:text-[var(--sx-on-primary)] lg:placeholder:text-[var(--sx-on-primary-mute)]"
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
