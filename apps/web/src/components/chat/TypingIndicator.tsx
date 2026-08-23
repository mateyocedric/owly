import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 bg-zinc-900/60 rounded-xl w-fit border border-zinc-800/80">
      <span className="font-medium text-zinc-400">Stranger is typing</span>
      <div className="flex gap-1 items-center ml-1">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
      </div>
    </div>
  );
}
