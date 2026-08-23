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

  const ghostControlClass =
    "shrink-0 whitespace-nowrap !py-2 !text-[10px] border-white/30 bg-black/50 backdrop-blur-sm hover:bg-white/20 lg:!py-2 lg:!text-xs lg:border-[var(--sx-on-primary)] lg:bg-transparent lg:backdrop-blur-none lg:hover:bg-[var(--sx-on-primary)] lg:hover:text-[var(--sx-ink)]";

  return (
    <div className="@container flex flex-wrap items-center justify-between gap-2 px-3 py-2 lg:px-4 lg:py-3">
      <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
        <GhostButton
          onClick={onNext}
          className={`${ghostControlClass} min-w-0 !px-3 lg:min-w-[100px] lg:!px-4`}
        >
          <ArrowRight className="size-4 lg:size-4" />
          {isPartnerLeft ? "Find New" : "Next"}
        </GhostButton>

        <GhostButton
          onClick={onStop}
          className={`${ghostControlClass} !px-3 lg:!px-4`}
        >
          <Square className="size-4 lg:size-3.5" />
          Stop
        </GhostButton>
      </div>

      {(isConnected || isPartnerLeft) && (
        <div className="flex shrink-0 items-center gap-1.5">
          <GhostButton
            onClick={onOpenReport}
            aria-label="Report"
            className={`${ghostControlClass} !px-2 @[32rem]:!px-3`}
          >
            <Flag className="size-3.5" />
            <span className="hidden @[32rem]:inline">Report</span>
          </GhostButton>

          <GhostButton
            onClick={onBlock}
            aria-label="Block"
            className={`${ghostControlClass} !px-2 @[32rem]:!px-3`}
          >
            <ShieldBan className="size-3.5" />
            <span className="hidden @[32rem]:inline">Block</span>
          </GhostButton>
        </div>
      )}
    </div>
  );
}
