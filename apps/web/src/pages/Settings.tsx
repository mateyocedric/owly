import React from "react";
import { Link } from "react-router-dom";
import { Button, Badge } from "@owly/ui";
import { useAppStore } from "../lib/store.js";
import { User, Trash2, ArrowLeft } from "lucide-react";

export function SettingsPage() {
  const session = useAppStore((s) => s.session);
  const resetChat = useAppStore((s) => s.resetChat);
  const setSession = useAppStore((s) => s.setSession);

  const handleClearSession = () => {
    resetChat();
    setSession(null);
    window.location.href = "/";
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-800">
        <div className="flex items-center gap-3 text-violet-400 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30">
            <User className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Session Settings</h2>
            <p className="text-xs text-zinc-400">Manage your temporary anonymous session</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Session Status:</span>
              <Badge variant="success">Active (Anonymous)</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Age Verified:</span>
              <span className="text-zinc-200">
                {session?.ageVerified ? "18+ Confirmed" : "Not Verified"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Interests Configured:</span>
              <span className="text-zinc-200">
                {session?.interests?.length
                  ? session.interests.join(", ")
                  : "Random"}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleClearSession}
              variant="destructive"
              className="w-full bg-red-600/90 hover:bg-red-500 text-white font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset & Clear Session Data
            </Button>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4 flex justify-start">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
