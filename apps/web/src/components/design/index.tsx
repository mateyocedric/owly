import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PageContainer({
  children,
  narrow,
  wide,
  className = "",
}: {
  children: React.ReactNode;
  narrow?: boolean;
  wide?: boolean;
  className?: string;
}) {
  const max = wide ? "max-w-6xl" : narrow ? "max-w-xl" : "max-w-3xl";
  return (
    <div className={`mx-auto ${max} px-4 py-12 sm:px-6 ${className}`}>{children}</div>
  );
}

export function PagePanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`sx-panel space-y-6 ${className}`}>{children}</div>;
}

export function LightSurface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`sx-light-surface space-y-4 ${className}`}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2 border-b border-[var(--sx-hairline-on-dark)] pb-4">
      {eyebrow ? <p className="sx-eyebrow">{eyebrow}</p> : null}
      <h1 className="sx-display-page">{title}</h1>
      {description ? <p className="sx-caption">{description}</p> : null}
    </div>
  );
}

export function PanelHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1 border-b border-[var(--sx-hairline-on-dark)] pb-4">
      <h2 className="sx-panel-title">{title}</h2>
      {description ? <p className="sx-caption">{description}</p> : null}
    </div>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`sx-btn-ghost-on-dark ${className}`} {...props}>
      {children}
    </button>
  );
}

export function GhostButtonLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`sx-btn-ghost-on-dark ${className}`}>
      {children}
    </Link>
  );
}

export function GhostButtonLight({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`sx-btn-ghost-on-light ${className}`} {...props}>
      {children}
    </button>
  );
}

export function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="sx-feature-card space-y-3">
      <h3 className="sx-panel-title text-base">{title}</h3>
      <p className="sx-caption leading-relaxed">{description}</p>
    </article>
  );
}

export function BackLink({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="sx-link-on-dark inline-flex items-center gap-2 sx-caption uppercase tracking-wider">
      <ArrowLeft className="size-4" />
      Back to Home
    </Link>
  );
}

export function ProseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="sx-panel-title text-base">{title}</h3>
      <div className="sx-body text-[15px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}
