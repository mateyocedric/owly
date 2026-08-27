export const SITE_ORIGIN = "https://owly.fun";

export const DEFAULT_TITLE = "Owly — Free Anonymous Chat with Strangers (18+)";
export const DEFAULT_DESCRIPTION =
  "Chat with strangers instantly. Free anonymous text and video chat, no signup. 18+ Omegle-style matching with interest tags, skip, and report.";

export type PublicPageSeo = {
  path: string;
  file: string;
  title: string;
  description: string;
  noscript: string;
};

export const PUBLIC_PAGES: PublicPageSeo[] = [
  {
    path: "/privacy",
    file: "privacy.html",
    title: "Privacy Policy — Owly",
    description:
      "How Owly handles privacy: minimal data collection, ephemeral chats, and no PII shared with chat partners.",
    noscript: `<main><h1>Privacy Policy</h1><p>Owly collects as little as possible. No accounts. Unreported chats are not kept after the session ends. Chat partners never see your IP, email, or hardware IDs.</p><p><a href="/">Back to Owly</a></p></main>`,
  },
  {
    path: "/terms",
    file: "terms.html",
    title: "Terms of Use — Owly",
    description:
      "Terms of use for Owly anonymous chat: eligibility, acceptable conduct, and account-free session rules.",
    noscript: `<main><h1>Terms of Use</h1><p>You must be 18 or older to use Owly. Do not send illegal, abusive, or exploitative content. We may block access for violations.</p><p><a href="/">Back to Owly</a></p></main>`,
  },
  {
    path: "/guidelines",
    file: "guidelines.html",
    title: "Community Guidelines — Owly",
    description:
      "Community guidelines for Owly: protect your identity, stay respectful, and report unsafe behavior.",
    noscript: `<main><h1>Community Guidelines</h1><p>Protect your identity. Do not share your name, location, or social accounts. Zero tolerance for CSAM, threats, doxxing, and fraud.</p><p><a href="/">Back to Owly</a></p></main>`,
  },
];

export function publicPage(path: string): PublicPageSeo {
  const page = PUBLIC_PAGES.find((entry) => entry.path === path);
  if (!page) {
    throw new Error(`Missing public page SEO for ${path}`);
  }
  return page;
}

export const HOMEPAGE_FAQ = [
  {
    question: "Does Owly have video chat?",
    answer:
      "Yes. Owly supports both anonymous text chat and live 1-on-1 video chat in the browser. No app download is required.",
  },
  {
    question: "Is Owly free? Do I need an account?",
    answer:
      "Owly is free to use and does not require an account, email, or username. Confirm you are 18+, optionally pick interests, and start chatting.",
  },
  {
    question: "Is Owly 18+ only?",
    answer:
      "Yes. Owly is age-gated for adults 18 and older. You must confirm your age before entering chat.",
  },
  {
    question: "Are chats saved?",
    answer:
      "No. Conversations are ephemeral. Once a session ends, chat history is not archived for later viewing. Reported sessions may keep recent messages for staff review.",
  },
  {
    question: "How does moderation work?",
    answer:
      "Owly uses proactive content filters, one-click reporting, and staff tools to block abuse. You can skip a partner instantly or report unsafe behavior.",
  },
] as const;

export function faqJsonLd(
  items: readonly { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
