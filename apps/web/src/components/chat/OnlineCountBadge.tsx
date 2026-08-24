interface OnlineCountBadgeProps {
  count: number | null;
  className?: string;
}

export function OnlineCountBadge({ count, className = "" }: OnlineCountBadgeProps) {
  if (count == null) {
    return null;
  }

  return (
    <p
      className={`sx-caption uppercase tracking-wider text-[var(--sx-on-primary-mute)] ${className}`}
      aria-live="polite"
    >
      {count.toLocaleString()} online
    </p>
  );
}
