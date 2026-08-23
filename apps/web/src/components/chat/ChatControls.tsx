import React from "react";
import { ArrowRight, Square, Flag, ShieldBan } from "lucide-react";
import type { ConnectionState } from "@owly/shared";
import { GhostButton } from "../design/index.js";

interface ChatControlsProps {
  connectionState: ConnectionState;
  onNext: () => void;
  onStop: () => void;
  onOpenReport: () => void;
  onBlock: () => void;
}

export function ChatControls({
  connectionState,
  onNext,
  onStop,
  onOpenReport,
  onBlock,
}: ChatControlsProps) {
  const isConnected = connectionState === "connected";
  const isPartnerLeft = connectionState === "partner_left";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sx-hairline-on-dark)] p-3">
      <div className="flex items-center gap-2">
        <GhostButton onClick={onNext} className="min-w-[100px] px-4 py-2 text-xs">
          <ArrowRight className="size-4" />
          {isPartnerLeft ? "Find New" : "Next"}
        </GhostButton>

        <GhostButton onClick={onStop} className="px-4 py-2 text-xs">
          <Square className="size-3.5" />
          Stop
        </GhostButton>
      </div>

      {(isConnected || isPartnerLeft) && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenReport}
            className="sx-caption inline-flex items-center gap-1 uppercase tracking-wider text-[var(--sx-on-primary-mute)] hover:text-[var(--sx-on-primary)]"
          >
            <Flag className="size-3.5" />
            Report
          </button>

          <button
            type="button"
            onClick={onBlock}
            className="sx-caption inline-flex items-center gap-1 uppercase tracking-wider text-[var(--sx-on-primary-mute)] hover:text-[var(--sx-on-primary)]"
          >
            <ShieldBan className="size-3.5" />
            Block
          </button>
        </div>
      )}
    </div>
  );
}
