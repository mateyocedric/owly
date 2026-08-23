import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Shield, UserX } from "lucide-react";
import { useAppStore } from "../lib/store.js";
import {
  FeatureCard,
  GhostButton,
  PageContainer,
} from "../components/design/index.js";

export function LandingPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);

  const handleStart = () => {
    if (ageVerified) {
      navigate("/chat");
    } else {
      navigate("/age-gate");
    }
  };

  return (
    <PageContainer wide className="space-y-16 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <p className="sx-eyebrow">Next-Gen Private Anonymous Chat</p>

        <h1 className="sx-display-hero">
          Talk to strangers.
          <br />
          Safely &amp; ephemerally.
        </h1>

        <p className="sx-body mx-auto max-w-2xl">
          Connect one-on-one with real people around the globe. No profiles, no saved history,
          zero personal tracking. Match by shared interests or go totally random.
        </p>

        <div className="flex flex-col items-center gap-6 pt-4">
          <GhostButton onClick={handleStart} className="w-full sm:w-auto">
            Start Chatting
            <ArrowRight className="size-4" />
          </GhostButton>
          <Link to="/interests" className="sx-link-on-dark sx-caption uppercase tracking-wider">
            Select interests before matching
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <span className="sx-caption inline-flex items-center gap-1.5 uppercase tracking-wider">
            <Lock className="size-3.5" /> Ephemeral
          </span>
          <span className="sx-caption inline-flex items-center gap-1.5 uppercase tracking-wider">
            <Shield className="size-3.5" /> 18+ Verified
          </span>
          <span className="sx-caption inline-flex items-center gap-1.5 uppercase tracking-wider">
            <UserX className="size-3.5" /> No Sign-up
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FeatureCard
          title="100% Anonymous"
          description="We never expose IP addresses, emails, or hardware IDs to chat partners. Identity stays completely anonymous."
        />
        <FeatureCard
          title="Instant Pairing"
          description="Atomic queue matching connects waiting users in milliseconds with seamless skip and reconnect."
        />
        <FeatureCard
          title="Proactive Moderation"
          description="Built-in content filters with one-click report and instant block tools to keep conversations safe."
        />
      </div>
    </PageContainer>
  );
}
