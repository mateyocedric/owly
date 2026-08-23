import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Sparkles, MessageSquare, Lock } from "lucide-react";
import { Badge } from "@owly/ui";

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-violet-600/30">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Owly
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
              Safe Random Chat
            </span>
          </div>
        </Link>

        {/* Status / Links */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-violet-400" />
            <span>Ephemeral & Private</span>
          </div>

          <Badge variant="outline" className="text-zinc-300 border-zinc-700 bg-zinc-900/50">
            <Shield className="h-3 w-3 mr-1 text-emerald-400" />
            18+ Age Gated
          </Badge>

          {isAdmin ? (
            <Link
              to="/admin"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              Moderator Portal
            </Link>
          ) : (
            <Link
              to="/guidelines"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Guidelines
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
