import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Shield, UserX } from "lucide-react";
import { useAppStore } from "../lib/store.js";
import { Seo } from "../components/Seo.js";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, HOMEPAGE_FAQ } from "../lib/seo.js";
import {
  FeatureCard,
  GhostButton,
  PageContainer,
  ProseSection,
} from "../components/design/index.js";

const HOW_IT_WORKS = [
  {
    title: "Confirm you are 18+",
    body: "Owly is adults-only. Age verification and community guidelines come before any chat.",
  },
  {
    title: "Optional interests",
    body: "Add topics you want to talk about, or skip them and match completely at random.",
  },
  {
    title: "Text or video",
    body: "Choose anonymous text chat or live 1-on-1 video. Both run in the browser — no app.",
  },
  {
    title: "Skip or report",
    body: "Move to the next person anytime. Report and block tools are one click away.",
  },
] as const;

export function LandingPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);
  const gender = useAppStore((s) => s.gender);

  const handleStart = () => {
    if (ageVerified && gender) {
      navigate("/session");
    } else {
      navigate("/age-gate");
    }
  };

  return (
    <>
      <Seo title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} path="/" />
      <PageContainer wide className="space-y-16 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <h1 className="sx-display-hero">
            Talk to strangers.
            <br />
            Text or video.
          </h1>

          <p className="sx-body mx-auto max-w-2xl">
            Owly is a free, no-account Omegle-style chat for adults 18+. Match one-on-one with
            strangers by interests or go fully random. Skip, report, and chats disappear when the
            session ends.
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
              <Lock className="size-3.5" /> No Sign-up
            </span>
            <span className="sx-caption inline-flex items-center gap-1.5 uppercase tracking-wider">
              <Shield className="size-3.5" /> 18+ Age Gated
            </span>
            <span className="sx-caption inline-flex items-center gap-1.5 uppercase tracking-wider">
              <UserX className="size-3.5" /> Anonymous
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            title="Text and video"
            description="Chat 1-on-1 with a stranger over anonymous text or live video. Both modes work in any modern browser."
          />
          <FeatureCard
            title="Instant matching"
            description="Join a queue and get paired in seconds. Skip to the next person whenever you want a new conversation."
          />
          <FeatureCard
            title="Moderated, 18+"
            description="Built-in filters, one-click report, and staff tools. Owly is for adults only — no profiles, no saved history."
          />
        </div>

        <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="how-heading">
          <h2 id="how-heading" className="sx-display-page text-center">
            How Owly works
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {HOW_IT_WORKS.map((step, index) => (
              <article key={step.title} className="space-y-2">
                <p className="sx-eyebrow">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="sx-panel-title text-base">{step.title}</h3>
                <p className="sx-caption leading-relaxed">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl space-y-6" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="sx-display-page text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {HOMEPAGE_FAQ.map((item) => (
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
