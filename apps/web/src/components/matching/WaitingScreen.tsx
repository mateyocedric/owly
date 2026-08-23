import React from "react";
import { Button } from "@owly/ui";
import { Loader2, Sparkles, X } from "lucide-react";

interface WaitingScreenProps {
  position?: number | null;
  interests?: string[];
  onCancel: () => void;
}

export function WaitingScreen({
  position,
  interests = [],
  onCancel,
}: WaitingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-auto space-y-6">
      {/* Animated matching radar */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full bg-violet-600/20 animate-ping" />
        <div className="absolute h-24 w-24 rounded-full bg-indigo-600/30 animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/40 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Finding someone for you...
        </h3>
        <p className="text-sm text-zinc-400">
          Looking for active users online.
          {interests.length > 0
            ? " Prioritizing people who share your topics."
            : " Matching randomly."}
        </p>
      </div>

      {interests.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Topics:
          </span>
          {interests.map((interest) => (
            <span
              key={interest}
              className="text-xs bg-violet-950/60 border border-violet-700/50 text-violet-300 rounded-full px-2.5 py-0.5"
            >
              #{interest}
            </span>
          ))}
        </div>
      )}

      {position !== null && position !== undefined && (
        <div className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5">
          Queue position: <strong className="text-zinc-200">#{position}</strong>
        </div>
      )}

      <Button
        onClick={onCancel}
        variant="outline"
        size="default"
        className="border-zinc-700 text-zinc-400 hover:text-white"
      >
        <X className="h-4 w-4 mr-1.5" />
        Cancel Matchmaking
      </Button>
    </div>
  );
}
