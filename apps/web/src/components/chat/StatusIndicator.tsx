import React from "react";
import type { ConnectionState } from "@owly/shared";

interface StatusIndicatorProps {
  state: ConnectionState;
  commonInterests?: string[];
}

export function StatusIndicator({ state, commonInterests }: StatusIndicatorProps) {
  const configs: Record<
    ConnectionState,
    { label: string; dotClass: string; bgClass: string; textClass: string }
  > = {
    idle: {
      label: "Ready to chat",
      dotClass: "bg-zinc-500",
      bgClass: "bg-zinc-800/40 border-zinc-700",
      textClass: "text-zinc-400",
    },
    finding: {
      label: "Looking for a partner...",
      dotClass: "bg-amber-400 animate-ping",
      bgClass: "bg-amber-500/10 border-amber-500/30",
      textClass: "text-amber-300",
    },
    connected: {
      label: commonInterests?.length
        ? `Connected (${commonInterests.join(", ")})`
        : "Connected with a stranger",
      dotClass: "bg-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/30",
      textClass: "text-emerald-300",
    },
    disconnected: {
      label: "Disconnected",
      dotClass: "bg-zinc-600",
      bgClass: "bg-zinc-800/30 border-zinc-700",
      textClass: "text-zinc-500",
    },
    partner_left: {
      label: "Partner disconnected",
      dotClass: "bg-red-400",
      bgClass: "bg-red-500/10 border-red-500/30",
      textClass: "text-red-300",
    },
    error: {
      label: "Connection error",
      dotClass: "bg-red-500",
      bgClass: "bg-red-500/20 border-red-500/40",
      textClass: "text-red-400",
    },
  };

  const config = configs[state] || configs.idle;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition-all duration-300 ${config.bgClass} ${config.textClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </div>
  );
}
