import React from "react";
import { BackLink, PageContainer, PageHeader, ProseSection } from "../components/design/index.js";
import { Seo } from "../components/Seo.js";
import { publicPage } from "../lib/seo.js";
import { owlyEmail, owlyMailto } from "../lib/config.js";

const page = publicPage("/privacy");

export function PrivacyPage() {
  return (
    <PageContainer className="space-y-8">
      <Seo title={page.title} description={page.description} path={page.path} />
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated: February 2026"
      />

      <div className="space-y-8">
        <ProseSection title="1. Core Privacy Philosophy">
          <p>
            Owly was engineered from the ground up for minimal data collection. We do not require
            accounts, email addresses, phone numbers, or passwords. Your chats are strictly
            ephemeral and are not archived once the session ends.
          </p>
        </ProseSection>

        <ProseSection title="2. Data We Do Not Share with Partners">
          <p>
            We never share your IP address, browser fingerprint, location, or session identifiers
            with your chat partners. To them, you appear solely as an anonymous stranger.
          </p>
        </ProseSection>

        <ProseSection title="3. Safety, Abuse Prevention, and Reports">
          <p>To prevent severe abuse, scams, CSAM, and illegal activities:</p>
          <ul>
            <li>IP addresses are cryptographically hashed before storage.</li>
            <li>Reported sessions retain recent messages solely for staff review.</li>
            <li>Automated filters block prohibited keywords server-side.</li>
          </ul>
        </ProseSection>

        <ProseSection title="4. Data Retention">
          <p>
            Unreported chat messages are removed from server memory when a room closes. Ban records
            and moderation reports are retained for audit and legal compliance.
          </p>
        </ProseSection>

        <ProseSection title="5. Contact">
          <p>
            Privacy questions can be sent to{" "}
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
