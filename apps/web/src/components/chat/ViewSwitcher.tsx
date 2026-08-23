import React, { memo } from "react";
import { ArrowLeftRight } from "lucide-react";

export type VideoPrimaryView = "remote" | "self";

interface ViewSwitcherProps {
  primaryView: VideoPrimaryView;
  onSwitch: () => void;
}

export const ViewSwitcher = memo(function ViewSwitcher({
  primaryView,
  onSwitch,
}: ViewSwitcherProps) {
  const label =
    primaryView === "remote" ? "Switch to your view" : "Switch to their view";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSwitch();
      }}
      aria-label={label}
      title={label}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm border border-white/30 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
    >
      <ArrowLeftRight className="size-3" />
    </button>
  );
});
