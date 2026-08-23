import React from "react";
import { ShieldAlert } from "lucide-react";

export function SafetyReminder() {
  return (
    <div className="flex items-center gap-2 border border-[var(--sx-hairline-on-dark)] px-3 py-2 text-xs text-[var(--sx-on-primary-mute)]">
      <ShieldAlert className="size-4 shrink-0" />
      <p className="leading-tight">
        <strong className="text-[var(--sx-on-primary)]">Safety:</strong> Never share real names,
        social handles, phone numbers, or financial details.
      </p>
    </div>
  );
}
