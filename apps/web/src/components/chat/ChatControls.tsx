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
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 lg:px-4 lg:py-3">
      <div className="flex items-center gap-1.5 lg:gap-2">
        <GhostButton
          onClick={onNext}
          className="min-w-0 !px-2.5 !py-1 !text-[10px] border-white/30 bg-black/50 backdrop-blur-sm hover:bg-white/20 lg:min-w-[100px] lg:!px-4 lg:!py-2 lg:!text-xs lg:border-[var(--sx-on-primary)] lg:bg-transparent lg:backdrop-blur-none lg:hover:bg-[var(--sx-on-primary)] lg:hover:text-[var(--sx-ink)]"
        >
          <ArrowRight className="size-3 lg:size-4" />
          {isPartnerLeft ? "Find New" : "Next"}
        </GhostButton>

        <GhostButton
          onClick={onStop}
          className="!px-2.5 !py-1 !text-[10px] border-white/30 bg-black/50 backdrop-blur-sm hover:bg-white/20 lg:!px-4 lg:!py-2 lg:!text-xs lg:border-[var(--sx-on-primary)] lg:bg-transparent lg:backdrop-blur-none lg:hover:bg-[var(--sx-on-primary)] lg:hover:text-[var(--sx-ink)]"
        >
          <Square className="size-3 lg:size-3.5" />
          Stop
        </GhostButton>
      </div>

      {(isConnected || isPartnerLeft) && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex items-center gap-1 rounded-sm bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm hover:text-white lg:bg-transparent lg:px-0 lg:py-0 lg:sx-caption lg:text-[var(--sx-on-primary-mute)] lg:hover:text-[var(--sx-on-primary)]"
          >
            <Flag className="size-3.5" />
            Report
          </button>

          <button
            type="button"
            onClick={onBlock}
            className="inline-flex items-center gap-1 rounded-sm bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm hover:text-white lg:bg-transparent lg:px-0 lg:py-0 lg:sx-caption lg:text-[var(--sx-on-primary-mute)] lg:hover:text-[var(--sx-on-primary)]"
          >
            <ShieldBan className="size-3.5" />
            Block
          </button>
        </div>
      )}
    </div>
  );
}
