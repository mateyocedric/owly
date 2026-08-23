import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950/60 py-8 text-xs text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-violet-500" />
          <span>Owly &copy; {new Date().getFullYear()} — Built for safe, respectful conversations.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-zinc-200 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-zinc-200 transition-colors">
            Terms of Use
          </Link>
          <Link to="/guidelines" className="hover:text-zinc-200 transition-colors">
            Community Guidelines
          </Link>
          <Link to="/admin" className="text-zinc-600 hover:text-zinc-400 transition-colors">
            Staff
          </Link>
        </div>
      </div>
    </footer>
  );
}
