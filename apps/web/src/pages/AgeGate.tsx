import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Checkbox } from "@owly/ui";
import { useAppStore } from "../lib/store.js";
import {
  GhostButtonLight,
  LightSurface,
  PageContainer,
  PagePanel,
  PanelHeader,
} from "../components/design/index.js";

export function AgeGatePage() {
  const navigate = useNavigate();
  const setAgeVerified = useAppStore((s) => s.setAgeVerified);

  const [is18, setIs18] = useState(false);
  const [agreedRules, setAgreedRules] = useState(false);

  const handleProceed = () => {
    if (!is18 || !agreedRules) return;
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

        <LightSurface>
          <Alert>
            <AlertTitle>Community Guidelines</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>No hate speech, harassment, or discrimination.</li>
                <li>No sexual exploitation or CSAM.</li>
                <li>No scams, malware links, or phishing.</li>
                <li>No doxxing or requesting personal contact details.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>
              Moderation reports retain recent message context for review. Violations result in
              permanent IP bans.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={is18} onCheckedChange={(v) => setIs18(v === true)} />
              <span className="text-sm leading-snug">
                I am at least 18 years of age or older.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedRules}
                onCheckedChange={(v) => setAgreedRules(v === true)}
              />
              <span className="text-sm leading-snug">
                I agree to the Community Guidelines and Privacy Terms.
              </span>
            </label>
          </div>

          <GhostButtonLight
            onClick={handleProceed}
            disabled={!is18 || !agreedRules}
            className="mt-4 w-full"
          >
            Enter Anonymous Chat
            <ArrowRight className="size-4" />
          </GhostButtonLight>
        </LightSurface>
      </PagePanel>
    </PageContainer>
  );
}
