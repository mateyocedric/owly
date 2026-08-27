import React from "react";
import { BackLink, PageContainer, PageHeader, ProseSection } from "../components/design/index.js";
import { Seo } from "../components/Seo.js";
import { publicPage } from "../lib/seo.js";
import { owlyEmail, owlyMailto } from "../lib/config.js";

const page = publicPage("/terms");

export function TermsPage() {
  return (
    <PageContainer className="space-y-8">
      <Seo title={page.title} description={page.description} path={page.path} />
      <PageHeader eyebrow="Legal" title="Terms of Use" description="Last updated: February 2026" />

      <div className="space-y-8">
        <ProseSection title="1. Age Requirement">
          <p>
            You must be at least 18 years of age to use Owly. By clicking through the age
            verification screen, you represent and warrant that you are 18 or older.
          </p>
        </ProseSection>

        <ProseSection title="2. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul>
            <li>Transmit unlawful, threatening, abusive, or hateful content.</li>
            <li>Transmit or solicit explicit content involving minors.</li>
            <li>Engage in fraud, spamming, or phishing.</li>
            <li>Attempt to bypass rate limits or security filters.</li>
          </ul>
        </ProseSection>

        <ProseSection title="3. Termination of Access">
          <p>
            We reserve the right to immediately terminate access or block IP addresses for any
            violation of these terms without prior notice.
          </p>
        </ProseSection>

        <ProseSection title="4. Contact">
          <p>
            Questions about these terms can be sent to{" "}
            <a href={owlyMailto()} className="sx-link-on-dark">
              {owlyEmail()}
            </a>
            .
          </p>
        </ProseSection>
      </div>

      <div className="border-t border-[var(--sx-hairline-on-dark)] pt-6">
        <BackLink />
      </div>
    </PageContainer>
  );
}
