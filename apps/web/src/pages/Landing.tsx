import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Shield, UserX } from "lucide-react";
import { useAppStore } from "../lib/store.js";
import { Seo } from "../components/Seo.js";
import {
  FeatureCard,
  GhostButton,
  PageContainer,
  ProseSection,
} from "../components/design/index.js";

const FAQ_ITEMS = [
  {
    question: "Is Owly anonymous?",
    answer:
      "Yes. Owly does not require profiles, emails, or usernames. Chat partners never see your IP address, email, or hardware identifiers.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. There is no sign-up. You confirm you are 18+, optionally pick interests, and start chatting.",
  },
  {
    question: "Is Owly 18+ only?",
    answer:
      "Yes. Owly is age-gated for adults 18 and older. You must confirm your age before entering chat.",
  },
  {
    question: "Are chats saved?",
    answer:
      "No. Conversations are ephemeral. Once a session ends, chat history is not archived for later viewing.",
  },
  {
    question: "How does moderation work?",
    answer:
      "Owly uses proactive content filters, one-click reporting, and staff tools to block abuse and keep conversations safer.",
  },
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

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
    <>
      <Seo
        title="Owly — Anonymous Random Chat"
        path="/"
        jsonLd={FAQ_JSON_LD}
      />
      <PageContainer wide className="space-y-16 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-8 text-center">

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

        <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="sx-display-page text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <ProseSection key={item.question} title={item.question}>
                <p>{item.answer}</p>
              </ProseSection>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
