import React from "react";
import { siteUrl } from "../lib/config.js";

type SeoProps = {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const DEFAULT_DESCRIPTION =
  "Safe, ephemeral, 1-on-1 anonymous text chat with optional interest matching and proactive moderation.";

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noindex = false,
  jsonLd,
}: SeoProps) {
  const canonical = siteUrl(path);
  const robots = noindex ? "noindex, nofollow" : "index, follow";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </>
  );
}
