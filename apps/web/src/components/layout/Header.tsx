import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { OwlyLogo } from "../brand/OwlyLogo.js";

const KOFI_SCRIPT = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";
const KOFI_ID = "P6L025NPR2";

declare global {
  interface Window {
    kofiwidget2?: {
      init: (text: string, color: string, id: string) => void;
      getHTML: () => string;
    };
  }
}

function KofiWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draw = () => {
      if (!window.kofiwidget2 || !containerRef.current) return;
      window.kofiwidget2.init("Support Owly on Ko-fi", "#000000", KOFI_ID);
      containerRef.current.innerHTML = window.kofiwidget2.getHTML();
    };

    if (window.kofiwidget2) {
      draw();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${KOFI_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", draw);

    if (!existing) {
      script.src = KOFI_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      script.removeEventListener("load", draw);
    };
  }, []);

  return (
    <>
      <a
        href={`https://ko-fi.com/${KOFI_ID}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Support Owly on Ko-fi"
        className="inline-flex shrink-0 items-center sm:hidden"
      >
        <img
          src="https://storage.ko-fi.com/cdn/cup-border.png"
          alt="Support Owly on Ko-fi"
          className="h-4 w-auto"
        />
      </a>
      <div ref={containerRef} className="hidden shrink-0 items-center sm:flex" />
    </>
  );
}

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)]">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-6 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
          <OwlyLogo size="sm" alt="Owly" />
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--sx-on-primary)]">
              Owly
            </span>
          </div>
        </Link>

        <nav className="flex min-w-0 items-center gap-3 sm:gap-6">
          <KofiWidget />
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
