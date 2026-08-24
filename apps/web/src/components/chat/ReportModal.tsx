import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@owly/ui";
import { Flag, AlertTriangle } from "lucide-react";
import { REPORT_CATEGORIES, type ReportCategory } from "@owly/shared";
import { GhostButton } from "../design/index.js";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (category: ReportCategory, description?: string) => void;
}

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  spam: "Spam or Advertising",
  scam: "Scam or Phishing",
  sexual_exploitation: "Explicit / Inappropriate Sexual Content",
  threats: "Threats or Violence",
  hate_speech: "Hate Speech or Discrimination",
  doxxing: "Doxxing / Personal Info Sharing",
  personal_info_request: "Soliciting Personal Details",
  harassment: "Harassment or Bullying",
  underage: "Underage User (<18)",
  other: "Other Policy Violation",
};

export function ReportModal({ open, onOpenChange, onSubmit }: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>("harassment");
  const [description, setDescription] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDescription("");
      setCategory("harassment");
    }
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(category, description.trim() || undefined);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-[var(--sx-rounded-xs)] border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night-soft)] p-0 text-[var(--sx-on-primary)] shadow-2xl sm:max-w-md [&_[data-slot=dialog-close]]:text-[var(--sx-on-primary-mute)] [&_[data-slot=dialog-close]]:hover:text-[var(--sx-on-primary)]"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-3 border-b border-[var(--sx-hairline-on-dark)] px-6 py-5 text-left">
            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--sx-rounded-xs)] border border-red-400/40 bg-red-500/10 text-red-400">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <DialogTitle className="text-lg font-bold uppercase tracking-wide text-[var(--sx-on-primary)]">
                  Report Chat Partner
                </DialogTitle>
                <DialogDescription className="text-[13px] leading-relaxed text-[var(--sx-on-primary-mute)]">
                  Help keep Owly safe. Recent chat messages will be securely reviewed by our
                  moderation team.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <fieldset>
              <legend className="sx-label-cap mb-2">Reason for report *</legend>
              <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                {REPORT_CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <label
                      key={cat}
                      className={`flex cursor-pointer items-center gap-3 rounded-[var(--sx-rounded-xs)] border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? "border-[var(--sx-on-primary)] bg-white/10 text-[var(--sx-on-primary)]"
                          : "border-transparent text-[var(--sx-on-primary-mute)] hover:border-[var(--sx-hairline-on-dark)] hover:text-[var(--sx-on-primary)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-category"
                        value={cat}
                        checked={selected}
                        onChange={() => setCategory(cat)}
                        className="sr-only"
                      />
                      <span
                        className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[var(--sx-on-primary)]"
                            : "border-[var(--sx-hairline-on-dark)]"
                        }`}
                        aria-hidden
                      >
                        {selected ? (
                          <span className="size-1.5 rounded-full bg-[var(--sx-on-primary)]" />
                        ) : null}
                      </span>
                      {CATEGORY_LABELS[cat]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="report-details" className="sx-label-cap mb-2 block">
                Additional details (optional)
              </label>
              <textarea
                id="report-details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any helpful context..."
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-[var(--sx-rounded-xs)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] p-3 text-sm text-[var(--sx-on-primary)] placeholder:text-white/40 outline-none focus-visible:border-[var(--sx-on-primary)]"
              />
              <p className="mt-1.5 text-right text-[11px] tracking-wide text-white/40">
                {description.length}/500
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-[var(--sx-hairline-on-dark)] px-6 py-4 sm:gap-2">
            <GhostButton
              type="button"
              className="!px-4 !py-3 !text-[11px]"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </GhostButton>
            <Button
              type="submit"
              variant="destructive"
              className="h-auto rounded-[var(--sx-rounded-pill)] px-5 py-3 text-[11px] font-bold uppercase tracking-[1.17px]"
            >
              <Flag className="size-3.5" />
              Submit Report & End Chat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
