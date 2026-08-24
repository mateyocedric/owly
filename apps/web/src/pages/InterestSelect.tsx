import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { InterestTags } from "../components/matching/InterestTags.js";
import { useAppStore } from "../lib/store.js";
import { Seo } from "../components/Seo.js";
import {
  GhostButton,
  PageContainer,
  PagePanel,
  PanelHeader,
} from "../components/design/index.js";

export function InterestSelectPage() {
  const navigate = useNavigate();
  const interests = useAppStore((s) => s.interests);
  const setInterests = useAppStore((s) => s.setInterests);
  const ageVerified = useAppStore((s) => s.ageVerified);

  const handleStart = () => {
    if (!ageVerified) {
      navigate("/age-gate");
    } else {
      navigate("/chat");
    }
  };

  return (
    <PageContainer narrow>
      <Seo title="Choose Interests — Owly" path="/interests" noindex />
      <PagePanel>
        <PanelHeader
          title="Choose Interests"
          description="Match with people who share your topics"
        />

        <div className="space-y-5">
          <p className="sx-caption leading-relaxed">
            Adding topic tags prioritizes matching with people looking for the same topics. If no
            one with matching tags is waiting, we fall back to a random match after a few seconds.
          </p>

          <InterestTags
            selected={interests}
            onChange={(newInterests) => setInterests(newInterests)}
            max={5}
          />

          <div className="flex flex-col gap-3 border-t border-[var(--sx-hairline-on-dark)] pt-4 sm:flex-row">
            <GhostButton
              className="flex-1 justify-center"
              onClick={() => {
                setInterests([]);
                handleStart();
              }}
            >
              Skip — Random Match
            </GhostButton>

            <button type="button" className="sx-btn-filled-cool flex-1" onClick={handleStart}>
              Save &amp; Start
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </PagePanel>
    </PageContainer>
  );
}
