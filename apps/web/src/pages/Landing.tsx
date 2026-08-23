import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@owly/ui";
import {
  MessageSquare,
  Shield,
  Zap,
  Sparkles,
  Lock,
  ArrowRight,
  EyeOff,
  UserX,
} from "lucide-react";
import { useAppStore } from "../lib/store.js";

export function LandingPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);

  const handleStart = () => {
    if (ageVerified) {
      navigate("/chat");
    } else {
      navigate("/age-gate");
    }
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-16">
      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/10 to-transparent blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 relative space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-8 sm:pt-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Next-Gen Private Anonymous Chat</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Talk to strangers.{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Safely & Ephemerally.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Connect one-on-one with real people around the globe. No profiles, no saved history, zero personal tracking. Match by shared interests or go totally random.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={handleStart}
              size="xl"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold shadow-xl shadow-violet-600/30 rounded-2xl"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Start Chatting Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <Link to="/interests" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="xl"
                className="w-full border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200 rounded-2xl"
              >
                <Sparkles className="h-5 w-5 mr-2 text-violet-400" />
                Select Interests
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-zinc-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> End-to-end Ephemeral
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-violet-400" /> 18+ Age Verified
            </span>
            <span className="flex items-center gap-1.5">
              <UserX className="h-3.5 w-3.5 text-indigo-400" /> Zero Sign-up
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">100% Anonymous</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We never expose IP addresses, emails, or hardware IDs to chat partners. Identity stays completely anonymous.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instant Redis Pairing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Atomic queue matching connects waiting users in milliseconds with zero race conditions and seamless "Next" skips.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Proactive Moderation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Built-in scam, harassment, and exploitation content filters with 1-click report and instant block tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
