import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle, ShieldAlert } from "lucide-react";
import { Checkbox } from "@owly/ui";
import { useAppStore } from "../lib/store.js";
import {
  GhostButton,
  PageContainer,
  PagePanel,
  PanelHeader,
} from "../components/design/index.js";

const checkboxClass =
  "mt-0.5 size-4 border-[var(--sx-hairline-on-dark)] bg-transparent shadow-none data-[state=checked]:border-[var(--sx-on-primary)] data-[state=checked]:bg-[var(--sx-on-primary)] data-[state=checked]:text-[var(--sx-canvas-night)]";

const checkRowClass =
  "flex cursor-pointer items-start gap-3 rounded-[var(--sx-rounded-xs)] border border-[var(--sx-hairline-on-dark)] px-3 py-3 transition-colors hover:border-white/40 has-[[data-state=checked]]:border-[var(--sx-on-primary)] has-[[data-state=checked]]:bg-white/10";

export function AgeGatePage() {
  const navigate = useNavigate();
  const setAgeVerified = useAppStore((s) => s.setAgeVerified);

  const [is18, setIs18] = useState(false);
  const [agreedRules, setAgreedRules] = useState(false);
  const canProceed = is18 && agreedRules;

  const handleProceed = () => {
    if (!canProceed) return;
    setAgeVerified(true);
    navigate("/chat");
  };

  return (
    <PageContainer narrow>
      <PagePanel>
        <PanelHeader
          title="Age Verification"
          description="Please confirm before entering the chat"
        />

        <div className="space-y-4">
          <section className="rounded-[var(--sx-rounded-xs)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="size-4 text-[var(--sx-on-primary)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--sx-on-primary)]">
                Community Guidelines
              </h3>
            </div>
            <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-[var(--sx-on-primary-mute)]">
              <li>No hate speech, harassment, or discrimination.</li>
              <li>No sexual exploitation or CSAM.</li>
              <li>No scams, malware links, or phishing.</li>
              <li>No doxxing or requesting personal contact details.</li>
            </ul>
          </section>

          <section className="rounded-[var(--sx-rounded-xs)] border border-red-400/40 bg-red-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-red-400">
              <AlertTriangle className="size-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Notice</h3>
            </div>
            <p className="text-[13px] leading-relaxed text-[var(--sx-on-primary-mute)]">
              Moderation reports retain recent message context for review. Violations result in
              permanent IP bans.
            </p>
          </section>

          <div className="space-y-3 pt-1">
            <label className={checkRowClass}>
              <Checkbox
                checked={is18}
                onCheckedChange={(v) => setIs18(v === true)}
                className={checkboxClass}
              />
              <span className="text-sm leading-snug text-[var(--sx-on-primary)]">
                I am at least 18 years of age or older.
              </span>
            </label>

            <label className={checkRowClass}>
              <Checkbox
                checked={agreedRules}
                onCheckedChange={(v) => setAgreedRules(v === true)}
                className={checkboxClass}
              />
              <span className="text-sm leading-snug text-[var(--sx-on-primary)]">
                I agree to the Community Guidelines and Privacy Terms.
              </span>
            </label>
          </div>

          <GhostButton
            onClick={handleProceed}
            disabled={!canProceed}
            className="mt-2 w-full"
          >
            Enter Anonymous Chat
            <ArrowRight className="size-4" />
          </GhostButton>
        </div>
      </PagePanel>
    </PageContainer>
  );
}
