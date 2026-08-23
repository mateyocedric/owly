import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@owly/ui";
import { InterestTags } from "../components/matching/InterestTags.js";
import { useAppStore } from "../lib/store.js";
import { Sparkles, ArrowRight } from "lucide-react";

export function InterestSelectPage() {
  const navigate = useNavigate();
  const interests = useAppStore((s) => s.interests);
  const setInterests = useAppStore((s) => s.setInterests);
  const ageVerified = useAppStore((s) => s.ageVerified);

  const handleStart = () => {
    if (!ageVerified) {
      navigate("/age-gate");
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-800">
        <div className="flex items-center gap-3 text-violet-400 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Choose Your Interests</h2>
            <p className="text-xs text-zinc-400">Match with people who love what you love</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Adding topic tags prioritizes matching with people looking for the same topics. If no one with matching tags is waiting, we will fall back to a random match after a few seconds.
        </p>

        <InterestTags
          selected={interests}
          onChange={(newInterests) => setInterests(newInterests)}
          max={5}
        />

        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <Button
            onClick={() => {
              setInterests([]);
              handleStart();
            }}
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300"
          >
            Skip (Random Match)
          </Button>

          <Button
            onClick={handleStart}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold"
          >
            Save & Start Chat
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
