import React from "react";
import { Button } from "@owly/ui";
import { ArrowRight, Square, Flag, ShieldBan } from "lucide-react";
import type { ConnectionState } from "@owly/shared";

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
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-950/80 border-b border-zinc-800">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onNext}
          variant="default"
          size="default"
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-violet-600/30 min-w-[100px]"
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          {isPartnerLeft ? "Find New" : "Next"}
        </Button>

        <Button
          onClick={onStop}
          variant="outline"
          size="default"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <Square className="h-3.5 w-3.5 mr-1 text-red-400" />
          Stop
        </Button>
      </div>

      {/* Safety & Moderation Controls */}
      {(isConnected || isPartnerLeft) && (
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenReport}
            variant="ghost"
            size="sm"
            className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <Flag className="h-3.5 w-3.5 mr-1" />
            Report
          </Button>

          <Button
            onClick={onBlock}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <ShieldBan className="h-3.5 w-3.5 mr-1" />
            Block
          </Button>
        </div>
      )}
    </div>
  );
}
