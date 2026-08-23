import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <MessageSquare className="size-5 text-[var(--sx-on-primary)]" aria-hidden />
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--sx-on-primary)]">
              Owly
            </span>
            <span className="sx-eyebrow text-[10px] leading-none">Safe Random Chat</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <span className="hidden sx-eyebrow sm:inline">18+ Age Gated</span>
          {isAdmin ? (
            <Link to="/admin" className="sx-nav-link px-0 py-0">
              Staff Portal
            </Link>
          ) : (
            <Link to="/guidelines" className="sx-nav-link px-0 py-0">
              Guidelines
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
