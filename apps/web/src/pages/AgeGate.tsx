import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@owly/ui";
import { ShieldAlert, CheckSquare, Square, ArrowRight } from "lucide-react";
import { useAppStore } from "../lib/store.js";

export function AgeGatePage() {
  const navigate = useNavigate();
  const setAgeVerified = useAppStore((s) => s.setAgeVerified);

  const [is18, setIs18] = useState(false);
  const [agreedRules, setAgreedRules] = useState(false);

  const handleProceed = () => {
    if (!is18 || !agreedRules) return;
    setAgeVerified(true);
    navigate("/chat");
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-800">
        <div className="flex items-center gap-3 text-violet-400 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <ShieldAlert className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Age Verification & Rules</h2>
            <p className="text-xs text-zinc-400">Please confirm before entering the chat</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <h4 className="font-bold text-white text-sm">Community Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>No hate speech, harassment, cyberbullying, or discrimination.</li>
              <li>No sexual exploitation, non-consensual imagery, or CSAM.</li>
              <li>No financial scams, malware links, or phishing.</li>
              <li>No doxxing or requesting personal contact details.</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <strong>Notice:</strong> All moderation reports retain recent message context for review. Violations will result in permanent IP bans.
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <label
            onClick={() => setIs18(!is18)}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
          >
            <div className="text-violet-400">
              {is18 ? (
                <CheckSquare className="h-5 w-5 text-violet-400" />
              ) : (
                <Square className="h-5 w-5 text-zinc-600" />
              )}
            </div>
            <span className="text-xs font-semibold text-zinc-200">
              I am at least 18 years of age or older.
            </span>
          </label>

          <label
            onClick={() => setAgreedRules(!agreedRules)}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
          >
            <div className="text-violet-400">
              {agreedRules ? (
                <CheckSquare className="h-5 w-5 text-violet-400" />
              ) : (
                <Square className="h-5 w-5 text-zinc-600" />
              )}
            </div>
            <span className="text-xs font-semibold text-zinc-200">
              I agree to the Community Guidelines and Privacy Terms.
            </span>
          </label>
        </div>

        <Button
          onClick={handleProceed}
          disabled={!is18 || !agreedRules}
          size="lg"
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-violet-600/25 disabled:opacity-40"
        >
          Enter Anonymous Chat
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
