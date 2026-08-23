import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@owly/ui";
import { InterestTags } from "../components/matching/InterestTags.js";
import { useAppStore } from "../lib/store.js";
import {
  GhostButtonLight,
  LightSurface,
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
      <PagePanel>
        <PanelHeader
          title="Choose Interests"
          description="Match with people who share your topics"
        />

        <LightSurface>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Adding topic tags prioritizes matching with people looking for the same topics. If no
            one with matching tags is waiting, we fall back to a random match after a few seconds.
          </p>

          <InterestTags
            selected={interests}
            onChange={(newInterests) => setInterests(newInterests)}
            max={5}
          />

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
            <Button
              onClick={() => {
                setInterests([]);
                handleStart();
              }}
              variant="outline"
              className="flex-1"
            >
              Skip — Random Match
            </Button>

            <GhostButtonLight onClick={handleStart} className="flex-1 justify-center">
              Save &amp; Start
              <ArrowRight className="size-4" />
            </GhostButtonLight>
          </div>
        </LightSurface>
      </PagePanel>
    </PageContainer>
  );
}
