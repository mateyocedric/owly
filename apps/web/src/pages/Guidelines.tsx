import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, HeartHandshake, Eye, AlertOctagon } from "lucide-react";
import { Button } from "@owly/ui";

export function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <HeartHandshake className="h-7 w-7 text-emerald-400" />
          Community Guidelines
        </h1>
        <p className="text-xs text-zinc-400">Rules for safe and respectful conversations</p>
      </div>

      <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
        <div className="glass-card p-5 rounded-xl border border-zinc-800 space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-violet-400" />
            Protect Your Identity
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Never share your full name, location, social media handles (Instagram, Snapchat, Telegram, WhatsApp), phone number, or school/workplace with strangers. Treat all chat partners as unverified anonymous individuals.
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-zinc-800 space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-400" />
            Zero Tolerance Policies
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The following result in immediate permanent ban and law enforcement escalation where applicable:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-red-300 pl-2">
            <li>Child sexual abuse material or underage exploitation.</li>
            <li>Direct threats of violence or self-harm incitement.</li>
            <li>Doxxing, harassment campaigns, or extortion.</li>
            <li>Financial fraud and phishing attacks.</li>
          </ul>
        </div>
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
