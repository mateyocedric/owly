import React from "react";
import type { ConnectionState } from "@owly/shared";

interface StatusIndicatorProps {
  state: ConnectionState;
  commonInterests?: string[];
  className?: string;
}

export function StatusIndicator({ state, commonInterests, className = "" }: StatusIndicatorProps) {
  const configs: Record<ConnectionState, { label: string; dotClassName: string }> = {
    idle: { label: "Ready to chat", dotClassName: "bg-[var(--sx-ink-mute)]" },
    finding: {
      label: "Looking for a partner...",
      dotClassName: "bg-amber-400 animate-pulse",
    },
    connected: {
      label: commonInterests?.length
        ? `Connected (${commonInterests.join(", ")})`
        : "Connected with a stranger",
      dotClassName: "bg-emerald-400",
    },
    disconnected: { label: "Disconnected", dotClassName: "bg-[var(--sx-ink-mute)]" },
    partner_left: { label: "Partner disconnected", dotClassName: "bg-amber-500" },
    error: { label: "Connection error", dotClassName: "bg-red-500" },
  };

  const config = configs[state] || configs.idle;

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 border border-[var(--sx-hairline-on-dark)] px-3 py-1 sx-caption uppercase tracking-wider ${className}`}
    >
      <span className={`size-2 shrink-0 rounded-full ${config.dotClassName}`} />
      <span className="truncate">{config.label}</span>
    </div>
  );
}
