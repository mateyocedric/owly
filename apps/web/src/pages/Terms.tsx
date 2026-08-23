import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@owly/ui";

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-indigo-400" />
          Terms of Use
        </h1>
        <p className="text-xs text-zinc-400">Last updated: February 2026</p>
      </div>

      <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">1. Age Requirement</h3>
          <p>
            You must be at least 18 years of age to use Owly. By clicking through the age verification screen, you represent and warrant that you are 18 or older.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">2. Prohibited Conduct</h3>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li>Transmit any unlawful, threatening, abusive, defamatory, vulgar, or hateful content.</li>
            <li>Transmit or solicit explicit content involving minors under any circumstance.</li>
            <li>Engage in fraudulent schemes, commercial spamming, or phishing.</li>
            <li>Attempt to bypass rate limits, server security, or automated safety filters.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white">3. Termination of Access</h3>
          <p>
            We reserve the right to immediately terminate access or block IP addresses for any violation of these terms without prior notice.
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
