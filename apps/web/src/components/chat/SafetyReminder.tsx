import React from "react";
import { ShieldAlert } from "lucide-react";

export function SafetyReminder() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90 shadow-sm">
      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
      <p className="leading-tight">
        <strong>Safety reminder:</strong> Never share real names, social handles, phone numbers, location, or financial details with strangers.
      </p>
    </div>
  );
}
