import React from "react";
import { Link } from "react-router-dom";
import { owlyMailto } from "../../lib/config.js";

export function Footer() {
  return (
    <footer className="border-t border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8">
        <p className="sx-caption">
          Owly &copy; {new Date().getFullYear()} — Built for safe, respectful conversations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link to="/privacy" className="sx-nav-link px-0 py-0">
            Privacy
          </Link>
          <Link to="/terms" className="sx-nav-link px-0 py-0">
            Terms
          </Link>
          <Link to="/guidelines" className="sx-nav-link px-0 py-0">
            Guidelines
          </Link>
          <a href={owlyMailto()} className="sx-nav-link px-0 py-0">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
