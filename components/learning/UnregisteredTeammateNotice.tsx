'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { REGISTRATION_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/constants';

export function buildTeammateInviteMessage(email: string): string {
  return [
    'Hi, I am adding you to my team for the Qiskit Fall Fest 2026 Hackathon at SRM University-AP.',
    '',
    `Before I can add you, please sign in once at ${REGISTRATION_URL} using ${email} and complete the short participant profile (about 30 seconds).`,
    '',
    'Let me know once you are done so I can add you to the team.',
  ].join('\n');
}

export function UnregisteredTeammateNotice({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(buildTeammateInviteMessage(email));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="w-full rounded-lg border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 p-3 space-y-2 animate-in fade-in duration-200">
      <div className="flex items-start gap-1.5 font-semibold text-amber-900 dark:text-amber-200 text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px text-amber-600 dark:text-amber-400" />
        <span className="break-all">{email} has not registered on the portal yet</span>
      </div>
      <p className="text-[11.5px] leading-relaxed text-amber-900/90 dark:text-amber-200/90 pl-5">
        Teammates must sign in once at{' '}
        <span className="font-semibold">qffsrmap2026.com/learning</span> with this email and complete the
        30-second participant profile. Send them the invite below, then add them again once they have registered.
      </p>
      <div className="flex flex-wrap items-center gap-2 pl-5 pt-0.5">
        <button
          type="button"
          onClick={copyInvite}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-200/80 hover:bg-amber-300/90 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-100 font-semibold text-[11px] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Invite Copied' : 'Copy Invite Message'}</span>
        </button>
        <a
          href={REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-300 dark:border-amber-800 bg-white/70 hover:bg-white dark:bg-transparent dark:hover:bg-amber-950/60 text-amber-950 dark:text-amber-100 font-semibold text-[11px] transition-colors"
        >
          <span>Registration Page</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href={WHATSAPP_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-semibold text-[11px] transition-colors"
        >
          <MessageCircle className="w-3 h-3 text-[#25D366]" />
          <span>WhatsApp Support</span>
        </a>
      </div>
    </div>
  );
}
