import React from "react";
import { ArrowRight } from "lucide-react";
import { Seo } from "../components/Seo.js";
import { GhostButtonLink, PageContainer } from "../components/design/index.js";

export function NotFoundPage() {
  return (
    <PageContainer className="flex flex-1 flex-col items-center justify-center py-24 text-center sm:py-32">
      <Seo
        title="Page not found — Owly"
        description="This page does not exist on Owly."
        path="/"
        noindex
      />
      <p className="sx-eyebrow">404</p>
      <h1 className="sx-display-hero mt-4">Page not found</h1>
      <p className="sx-body mx-auto mt-6 max-w-md">
        This URL is not a page on Owly. Head home to start a new anonymous chat.
      </p>
      <div className="mt-10 flex flex-col items-center gap-6">
        <GhostButtonLink to="/" className="w-full sm:w-auto">
          Back to Home
          <ArrowRight className="size-4" />
        </GhostButtonLink>
      </div>
    </PageContainer>
  );
}
