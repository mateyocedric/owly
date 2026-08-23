import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@owly/ui";

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-violet-400" />
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400">Last updated: February 2026</p>
      </div>

      <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">1. Core Privacy Philosophy</h3>
          <p>
            Owly was engineered from the ground up for minimal data collection. We do not require accounts, email addresses, phone numbers, or passwords. Your chats are strictly ephemeral and are not archived or stored to persistent storage once the chat session ends.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">2. Data We Do Not Share with Partners</h3>
          <p>
            We never share your IP address, browser fingerprint, location, or session identifiers with your chat partners. To them, you appear solely as an anonymous stranger.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">3. Safety, Abuse Prevention, and Reports</h3>
          <p>
            To prevent severe abuse, scams, CSAM, and illegal activities:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li>IP addresses are cryptographically hashed using a salted HMAC algorithm before storage.</li>
            <li>If a user submits an in-chat moderation report, recent messages from that session are retained solely for review by authorized staff.</li>
            <li>Automated filters block prohibited keywords and patterns server-side before delivery.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">4. Data Retention</h3>
          <p>
            Unreported chat messages are completely removed from server memory immediately after a room closes. Ban records and moderation reports are retained for audit and legal compliance up to the configured retention windows (365 days).
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-zinc-800">
        <Link to="/">
          <Button variant="outline" className="border-zinc-700 text-zinc-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
