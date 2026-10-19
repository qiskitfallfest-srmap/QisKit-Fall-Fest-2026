'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleMinus,
  Clock,
  Hourglass,
  Loader2,
  Mail,
  Trophy,
  Users,
} from 'lucide-react';
import { PHASE1_SUBMISSION_COUNT, PHASE2_DESK_QUOTA, WHATSAPP_COMMUNITY_URL } from '@/lib/constants';
import { FLAGSHIP_PASS_FEE_INR } from '@/lib/payments';
import { usePassStatus, type PassStatusHackathon, type Phase2TeamStatus } from '@/hooks/use-pass-status';

const CONTACT_EMAIL = 'qiskitfallfest@srmap.edu.in';

function formatIst(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function Countdown({ deadlineIso, label }: { deadlineIso: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = now == null ? null : Math.max(0, Date.parse(deadlineIso) - now);
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock =
    remaining == null
      ? '--:--:--'
      : `${pad(Math.floor(remaining / 3_600_000))}:${pad(Math.floor((remaining % 3_600_000) / 60_000))}:${pad(
          Math.floor((remaining % 60_000) / 1000)
        )}`;
  const urgent = remaining != null && remaining < 3 * 3_600_000;

  return (
    <div
      className={clsx(
        'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3.5 py-2.5',
        urgent
          ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200'
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        {label}
      </span>
      <span className="font-mono text-lg font-bold tabular-nums">{clock}</span>
      <span className="w-full font-mono text-[11px] opacity-80">Until {formatIst(deadlineIso)} IST</span>
    </div>
  );
}

function ContactLine() {
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Questions? Write to{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a> or ask in the{' '}
      <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp community</a>.
    </p>
  );
}

function JuryNote({ phase2, showScore }: { phase2: Phase2TeamStatus; showScore: boolean }) {
  if (!phase2.feedback && !(showScore && phase2.score != null)) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-3.5 space-y-1.5">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
        Note from the jury
        {showScore && phase2.score != null && (
          <span className="ml-2 font-normal text-slate-500 dark:text-slate-400 tabular-nums">
            Score {phase2.score} / {phase2.maxScore ?? 100}
          </span>
        )}
      </p>
      {phase2.feedback && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{phase2.feedback}</p>}
    </div>
  );
}

function GeneralPassLink() {
  return (
    <Link
      href="/learning#campus-pass"
      className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-xs font-semibold rounded-lg"
    >
      Get the ₹99 General Pass
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );
}

function PaymentChecklist({ phase2, isLead }: { phase2: Phase2TeamStatus; isLead: boolean }) {
  const payment = phase2.payment;
  if (!payment) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        Team payments: {payment.members.filter((m) => m.paid).length} of {payment.members.length} submitted
      </p>
      <ul className="divide-y divide-slate-100 dark:divide-[#250D11] rounded-lg border border-slate-200 dark:border-[#3D1418]">
        {payment.members.map((m) => (
          <li key={m.email} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="text-slate-800 dark:text-slate-200 truncate">
              {m.name}
              {m.isLead && <span className="ml-1.5 text-[11px] text-slate-500">(lead, pays last)</span>}
            </span>
            <span
              className={clsx(
                'shrink-0 text-[11px] font-semibold',
                m.verified
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : m.paid
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-slate-400'
              )}
            >
              {m.verified ? 'Verified' : m.paid ? 'Submitted' : m.isLead && !payment.allOthersPaid ? 'Waiting for team' : 'Not paid'}
            </span>
          </li>
        ))}
      </ul>
      {!phase2.paymentLinkPublished ? (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Payments open when the link is published. Use this time to make sure every teammate can pay ₹{FLAGSHIP_PASS_FEE_INR}.
        </p>
      ) : null}
      {phase2.paymentLinkPublished && isLead && !payment.allOthersPaid && (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          You pay last. Make sure each teammate pays ₹{FLAGSHIP_PASS_FEE_INR} and submits their receipt from their own
          account; your payment unlocks once all {payment.othersTotal} have submitted.
        </p>
      )}
      {phase2.paymentLinkPublished && isLead && payment.allOthersPaid && !payment.leadPaid && (
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          All teammates have paid. Pay your ₹{FLAGSHIP_PASS_FEE_INR} in the Flagship Pass card to confirm your desk.
        </p>
      )}
      {phase2.paymentLinkPublished && !isLead && (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Pay ₹{FLAGSHIP_PASS_FEE_INR} and submit your receipt in the Flagship Pass card on your dashboard. Your team lead pays
          after everyone else.
        </p>
      )}
    </div>
  );
}

function LeadResponse({ team, onDone }: { team: PassStatusHackathon; onDone: () => void }) {
  const phase2 = team.phase2!;
  const [mode, setMode] = useState<'idle' | 'declining'>('idle');
  const [reason, setReason] = useState('');
  const [committed, setCommitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function respond(action: 'accept' | 'decline') {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/hackathon/phase2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason, committed: action === 'accept' ? committed : undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not record your response.');
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Could not record your response.');
    } finally {
      setBusy(false);
    }
  }

  const isWithdraw = phase2.stage === 'accepted';

  if (mode === 'declining') {
    return (
      <div className="space-y-2.5 rounded-lg border border-rose-200 dark:border-rose-900 p-3.5">
        <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
          {isWithdraw ? 'Withdraw from Phase 2?' : 'Decline the Phase 2 invitation?'}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          This is final for your whole team. The desk is offered to the next team in the waiting room right away.
          {isWithdraw && ' Teammates who already paid should contact the organizing committee with their transaction ID.'}
        </p>
        <textarea
          rows={2}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#100405]"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => respond('decline')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
          >
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isWithdraw ? 'Withdraw team' : 'Decline invitation'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode('idle')}
            className="px-4 py-2 border border-slate-300 dark:border-[#3D1418] text-xs font-semibold rounded-lg cursor-pointer"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>}
      </div>
    );
  }

  if (isWithdraw) {
    return (
      <button
        type="button"
        onClick={() => setMode('declining')}
        className="text-xs text-slate-500 hover:text-rose-700 underline cursor-pointer"
      >
        My team can no longer attend
      </button>
    );
  }

  const memberCount = team.phase2?.payment?.members.length;
  const windowText = phase2.paymentLinkPublished
    ? `within ${phase2.paymentWindowHours} hours of accepting`
    : `within ${phase2.paymentWindowHours} hours of the payment link opening (expected ${phase2.paymentLinkExpectedLabel})`;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-3.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-[#FAF6F3]">Confirming your team&apos;s Phase 2 finalist desk</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Your team will attend and build on-campus during the 24-hour sprint on 28–29 October at SRM University-AP.</li>
          <li>
            Every member completes their Flagship Pass (₹{FLAGSHIP_PASS_FEE_INR}) {windowText}. You, as team lead, pay last to lock in the desk.
          </li>
          <li>If payment or confirmation is not completed in time, the desk automatically passes to the next team in the waiting room.</li>
          <li>Your problem statement may be updated by an industry partner, or replaced with one in the same vertical.</li>
        </ul>
        <label className="flex items-start gap-2 pt-1 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={committed}
            onChange={(e) => setCommitted(e.target.checked)}
          />
          <span>
            I have confirmed with my team{memberCount ? ` (${memberCount} members)` : ''} — we are ready to attend on campus and confirm our desk.
          </span>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !committed}
          onClick={() => respond('accept')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-burgundy hover:bg-burgundy-deep text-white text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Accept Phase 2 Invitation
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode('declining')}
          className="px-4 py-2 border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-sm font-semibold rounded-lg cursor-pointer"
        >
          Decline
        </button>
      </div>
      {!phase2.paymentLinkPublished && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Nobody pays today. Accepting holds your desk until the payment link opens.
        </p>
      )}
      {error && <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>}
    </div>
  );
}

type Tone = 'celebrate' | 'positive' | 'waiting' | 'action' | 'muted';

/**
 * The team's Phase 2 standing: released result, waiting-room position, invitation
 * response (lead only), payment progress and calm copy for every closed state.
 */
export function Phase2StatusCard({ team, className }: { team: PassStatusHackathon; className?: string }) {
  const { mutate } = usePassStatus();
  const phase2 = team.phase2!;
  const trackLabel = phase2.track === 'internal' ? 'SRM AP' : 'external';

  let tone: Tone = 'waiting';
  let title = '';
  let body: React.ReactNode = null;
  let extra: React.ReactNode = null;

  switch (phase2.stage) {
    case 'under_review':
      title = 'Your result has not been released yet';
      body = (
        <>
          Results are released team by team, not all at once, so other teams may hear before you. Your team has not
          been ruled out. Nothing is needed from you now; this page updates on its own.
        </>
      );
      break;

    case 'no_submission':
      tone = 'muted';
      title = 'No Phase 1 submission was recorded';
      body = 'Your team did not submit a repository before the deadline. You can still attend the festival with a General Pass.';
      extra = <GeneralPassLink />;
      break;

    case 'waitlisted':
      title = 'Your team is in the Phase 2 waiting room';
      body = (
        <>
          All desks are currently offered to other teams. If an invited team declines or does not confirm in time, the
          next team in the waiting room is invited automatically, in order of jury score.
          {phase2.waitlistPosition != null && (
            <>
              {' '}Your team is <strong>number {phase2.waitlistPosition}</strong> of {phase2.waitlistSize} in the {trackLabel} list.
            </>
          )}{' '}
          If a desk opens, your team lead sees an Accept button here. Please do not pay anything yet.
        </>
      );
      extra = <JuryNote phase2={phase2} showScore={false} />;
      break;

    case 'invited':
      tone = 'celebrate';
      title = phase2.autoPromoted
        ? 'Congratulations! A finalist desk has opened for your team in Phase 2'
        : 'Congratulations! Your team has qualified for Phase 2';
      body = (
        <>
          {phase2.autoPromoted ? (
            <>
              <strong>Outstanding news!</strong> A desk has opened in the auditorium, and your team has been promoted from the waiting room to the Phase 2 on-campus hackathon.{' '}
            </>
          ) : (
            <>
              <strong>Exceptional work!</strong> Out of {PHASE1_SUBMISSION_COUNT} competing teams across India, the jury has selected your team as one of the top {PHASE2_DESK_QUOTA.total} Phase 2 finalists.{' '}
            </>
          )}
          You are invited to build on campus at SRM University-AP during the flagship 24-hour hackathon sprint on 28–29 October 2026.{' '}
          {team.isLead
            ? 'As team lead, please accept the invitation below to secure your team’s auditorium desk before the countdown expires.'
            : 'Your team lead will accept the invitation on behalf of the team to secure your auditorium desk before the countdown expires. Nobody pays until the team accepts.'}
        </>
      );
      extra = (
        <div className="space-y-3">
          {phase2.respondBy && <Countdown deadlineIso={phase2.respondBy} label="Time left to accept" />}
          {team.isLead && <LeadResponse team={team} onDone={() => mutate()} />}
          <JuryNote phase2={phase2} showScore={false} />
        </div>
      );
      break;

    case 'accepted':
      tone = phase2.payBy ? 'action' : 'positive';
      title = phase2.payBy ? 'Place accepted: complete team payment' : 'Your Phase 2 desk is held';
      body = phase2.payBy ? (
        <>
          Every member pays the ₹{FLAGSHIP_PASS_FEE_INR} Flagship Pass from their own account. The team lead pays last.
          The desk is confirmed when the lead&apos;s payment is submitted.
        </>
      ) : (
        <>
          Your team&apos;s desk is held. Nothing needs to be paid yet: the ₹{FLAGSHIP_PASS_FEE_INR} payment link is
          expected on {phase2.paymentLinkExpectedLabel}. Once it is published, your team gets{' '}
          {phase2.paymentWindowHours} hours to pay, starting from that moment. Each member then pays from their own
          account and the team lead pays last.
        </>
      );
      extra = (
        <div className="space-y-3">
          {phase2.payBy && <Countdown deadlineIso={phase2.payBy} label="Time left for team payment" />}
          <PaymentChecklist phase2={phase2} isLead={team.isLead} />
          {team.isLead && <LeadResponse team={team} onDone={() => mutate()} />}
        </div>
      );
      break;

    case 'confirmed':
      tone = 'celebrate';
      title = 'You are in: your Phase 2 desk is confirmed';
      body = 'Congratulations to the whole team. All payments are in; receipts are verified by the organizing team and your passes update once verified. See you on campus on 28 October.';
      extra = <PaymentChecklist phase2={phase2} isLead={team.isLead} />;
      break;

    case 'declined':
      tone = 'muted';
      title = 'Your team declined the Phase 2 invitation';
      body = 'The desk has been offered to another team. You can still attend the festival with a General Pass.';
      extra = <GeneralPassLink />;
      break;

    case 'expired':
      tone = 'muted';
      title =
        phase2.closeReason === 'payment_incomplete'
          ? 'Team payment was not completed in time'
          : 'The invitation was not accepted in time';
      body = (
        <>
          {phase2.closeReason === 'payment_incomplete'
            ? 'Not every member submitted a payment before the deadline, so the desk was offered to the next team. If anyone in your team already paid ₹499, contact us with the Easebuzz transaction ID.'
            : 'The deadline to accept passed without a response, so the desk was offered to the next team in the waiting room.'}{' '}
          If you think this is a mistake, contact us as soon as possible. You can still attend the festival with a General Pass.
        </>
      );
      extra = <GeneralPassLink />;
      break;

    case 'revoked':
      tone = 'muted';
      title = 'Your invitation was withdrawn by the organizers';
      body = 'Please contact the organizing committee for details. You can still attend the festival with a General Pass.';
      extra = <GeneralPassLink />;
      break;

    case 'not_selected':
      tone = 'muted';
      title = phase2.waitingRoomClosed
        ? 'All Phase 2 desks are filled'
        : 'Your team was not selected for Phase 2';
      body = phase2.waitingRoomClosed
        ? 'Every desk has been confirmed and the waiting room is now closed. Thank you for staying with us. You can still attend the festival with a General Pass.'
        : 'Thank you for submitting. You can still attend the on-campus festival with a General Pass.';
      extra = (
        <div className="space-y-3">
          <JuryNote phase2={phase2} showScore />
          <GeneralPassLink />
        </div>
      );
      break;
  }

  const Icon = tone === 'celebrate' ? Trophy : tone === 'positive' ? CheckCircle2 : tone === 'muted' ? CircleMinus : tone === 'action' ? Mail : Hourglass;
  const iconColor =
    tone === 'celebrate'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'muted'
        ? 'text-slate-400'
        : tone === 'action'
          ? 'text-burgundy dark:text-[#E89BA5]'
          : 'text-amber-600 dark:text-amber-400';

  return (
    <section
      aria-label="Phase 2 status"
      className={clsx(
        'rounded-xl border p-5 sm:p-6 space-y-4',
        tone === 'celebrate'
          ? 'border-amber-300 bg-amber-50/40 dark:border-amber-800/70 dark:bg-[#150709]'
          : 'border-slate-200 bg-white dark:border-[#3D1418] dark:bg-[#150709]',
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={clsx('inline-flex items-center gap-1.5', iconColor)}>
            <Icon className="w-3.5 h-3.5" aria-hidden />
            Phase 2
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 dark:text-slate-400">Team {team.teamName}</span>
        </div>
        <h2 className="font-serif text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">{body}</p>
      </div>
      {extra}
      <ContactLine />
    </section>
  );
}

/** One-line title for compact notices. */
export function phase2Headline(team: PassStatusHackathon): string {
  if (team.phase2?.stage === 'accepted' && !team.phase2.payBy) return 'Phase 2 desk held: payment link coming soon';
  const p = team.phase2;
  if (!p) return 'Phase 1 results';
  switch (p.stage) {
    case 'under_review': return 'Result not released yet';
    case 'waitlisted': return p.waitlistPosition ? `Waiting room: number ${p.waitlistPosition}` : 'Your team is in the waiting room';
    case 'invited': return team.isLead ? 'Congratulations! Selected for Phase 2: confirm your place' : 'Congratulations! Your team is selected for Phase 2';
    case 'accepted': return 'Accepted: complete team payment';
    case 'confirmed': return 'You are in: Phase 2 desk confirmed';
    case 'declined': return 'Phase 2 invitation declined';
    case 'expired': return 'Phase 2 invitation expired';
    case 'revoked': return 'Phase 2 invitation withdrawn';
    case 'no_submission': return 'No Phase 1 submission recorded';
    case 'not_selected': return p.waitingRoomClosed ? 'All Phase 2 desks are filled' : 'Not selected for Phase 2';
  }
}
