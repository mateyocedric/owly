import React from "react";
import { BackLink, PageContainer, PageHeader, ProseSection } from "../components/design/index.js";

export function GuidelinesPage() {
  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Community"
        title="Guidelines"
        description="Rules for safe and respectful conversations"
      />

      <div className="space-y-8">
        <ProseSection title="Protect Your Identity">
          <p>
            Never share your full name, location, social media handles, phone number, or
            school/workplace with strangers. Treat all chat partners as unverified anonymous
            individuals.
          </p>
        </ProseSection>

        <ProseSection title="Zero Tolerance Policies">
          <p>The following result in immediate permanent ban and law enforcement escalation:</p>
          <ul>
            <li>Child sexual abuse material or underage exploitation.</li>
            <li>Direct threats of violence or self-harm incitement.</li>
            <li>Doxxing, harassment campaigns, or extortion.</li>
            <li>Financial fraud and phishing attacks.</li>
          </ul>
        </ProseSection>
      </div>

      <div className="border-t border-[var(--sx-hairline-on-dark)] pt-6">
        <BackLink />
      </div>
    </PageContainer>
  );
}
