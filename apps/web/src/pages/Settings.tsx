import React from "react";
import { Button, Badge } from "@owly/ui";
import { useAppStore } from "../lib/store.js";
import {
  BackLink,
  LightSurface,
  PageContainer,
  PagePanel,
  PanelHeader,
} from "../components/design/index.js";

export function SettingsPage() {
  const session = useAppStore((s) => s.session);
  const resetChat = useAppStore((s) => s.resetChat);
  const setSession = useAppStore((s) => s.setSession);

  const handleClearSession = () => {
    resetChat();
    setSession(null);
    window.location.href = "/";
  };

  return (
    <PageContainer narrow>
      <PagePanel>
        <PanelHeader
          title="Session Settings"
          description="Manage your temporary anonymous session"
        />

        <LightSurface>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Session Status</dt>
              <dd>
                <Badge variant="success">Active (Anonymous)</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Age Verified</dt>
              <dd>{session?.ageVerified ? "18+ Confirmed" : "Not Verified"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Interests</dt>
              <dd className="text-right">
                {session?.interests?.length ? session.interests.join(", ") : "Random"}
              </dd>
            </div>
          </dl>

          <Button onClick={handleClearSession} variant="destructive" className="w-full">
            Reset &amp; Clear Session Data
          </Button>
        </LightSurface>

        <div className="border-t border-[var(--sx-hairline-on-dark)] pt-4">
          <BackLink />
        </div>
      </PagePanel>
    </PageContainer>
  );
}
