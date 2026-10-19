'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  ArrowRight,
  Award,
  Bell,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  FileText,
  Github,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  PlayCircle,
  Receipt,
  Terminal,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { Phase2StatusCard } from '@/components/learning/Phase2StatusCard';
import { FLAGSHIP_PASS_FEE_INR, passTierLabel } from '@/lib/payments';
import { REGISTRATION_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/constants';
import { NOTICE_SEVERITY_LABEL, type Notice } from '@/lib/notices';
import type { PassStatusResponse } from '@/hooks/use-pass-status';
import type { ProfileOverview } from '@/hooks/use-profile-overview';
import {
  Card,
  DetailRow,
  EmptyState,
  ProgressBar,
  StatusPill,
  buttonStyles,
  formatIst,
  timeLeft,
  type Tone,
  useResultsOut,
} from './profile-ui';

const CONTACT_EMAIL = 'qiskitfallfest@srmap.edu.in';
const PASS_HREF = '/learning#campus-pass';

function openCertificateModal() {
  window.dispatchEvent(new Event('open-certificate-modal'));
}

/* ───────────────────────────── Notices ───────────────────────────── */

const SEVERITY_TONE: Record<Notice['severity'], Tone> = { info: 'neutral', action: 'warning', urgent: 'danger' };

export function NoticeItem({ notice, unread }: { notice: Notice; unread: boolean }) {
  const external = notice.linkHref && /^https?:\/\//.test(notice.linkHref);
  return (
    <article
      className={clsx(
        'relative rounded-lg border p-4 space-y-2',
        notice.severity === 'urgent'
          ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/70 dark:bg-rose-950/20'
          : notice.severity === 'action'
            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/15'
            : 'border-slate-200 bg-white dark:border-[#3D1418] dark:bg-[#150709]'
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {unread && <span className="h-2 w-2 rounded-full bg-burgundy dark:bg-[#E89BA5]" aria-label="Unread" />}
        {notice.severity !== 'info' && <StatusPill tone={SEVERITY_TONE[notice.severity]}>{NOTICE_SEVERITY_LABEL[notice.severity]}</StatusPill>}
        {notice.pinned && <StatusPill tone="info">Pinned</StatusPill>}
        <time className="text-[11px] text-slate-500 dark:text-slate-400" dateTime={notice.publishedAt}>
          {formatIst(notice.publishedAt)} IST
        </time>
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">{notice.title}</h3>
      {notice.body && (
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{notice.body}</p>
      )}
      {notice.linkHref && (
        <a
          href={notice.linkHref}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="inline-flex items-center gap-1 text-sm font-semibold text-burgundy dark:text-[#E89BA5] hover:underline"
        >
          {notice.linkLabel || 'Open link'}
          {external ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </a>
      )}
    </article>
  );
}

export function NoticesSection({ notices, seen }: { notices: Notice[]; seen: Set<string> }) {
  return (
    <Card title="Notices" description="Announcements from the organizing team. Notices for your team and role appear here too.">
      {notices.length === 0 ? (
        <EmptyState icon={Bell} title="No notices right now">
          Important updates will appear here. Urgent ones are also shared in the{' '}
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="underline">
            WhatsApp community
          </a>
          .
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <NoticeItem key={n.id} notice={n} unread={!seen.has(n.id)} />
          ))}
        </div>
      )}
    </Card>
  );
}

/* ───────────────────────────── Hackathon ───────────────────────────── */

export function HackathonSection({ overview, status }: { overview: ProfileOverview; status?: PassStatusResponse }) {
  const team = overview.team;
  const hackathon = status?.hackathon;
  const resultsOut = useResultsOut();

  if (!team) {
    return (
      <Card title="Hackathon">
        <EmptyState icon={Users} title="You are not on a hackathon team">
          {overview.pendingInvitations.length > 0 ? (
            <>
              You have {overview.pendingInvitations.length} pending invitation
              {overview.pendingInvitations.length === 1 ? '' : 's'}. Respond in the workspace.
            </>
          ) : (
            <>The hackathon is optional. Your masterclasses, competitions and pass work without a team.</>
          )}
        </EmptyState>
        <div className="flex justify-center">
          <Link href="/learning/hackathon" className={buttonStyles.secondary}>
            Open Hackathon Workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>
    );
  }

  const accepted = team.members.filter((m) => m.status === 'accepted');
  const invited = team.members.filter((m) => m.status === 'invited');

  return (
    <div className="space-y-4">
      {hackathon?.phase2 && resultsOut && <Phase2StatusCard team={hackathon} />}

      <Card
        title={team.name}
        description={team.isLead ? 'You are the team lead.' : 'You are a team member.'}
        action={
          <Link href="/learning/hackathon" className={buttonStyles.secondary}>
            Workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <dl className="divide-y divide-slate-100 dark:divide-[#250D11] -mt-2">
          {team.vertical && <DetailRow label="Track">{team.vertical}</DetailRow>}
          {team.problemStatementTitle && <DetailRow label="Problem statement">{team.problemStatementTitle}</DetailRow>}
          <DetailRow label="Phase 1 submission">
            {team.repoUrl ? (
              <span className="flex flex-wrap items-center gap-2">
                <StatusPill tone="success">Submitted</StatusPill>
                <a
                  href={team.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-burgundy dark:text-[#E89BA5] hover:underline break-all"
                >
                  <Github className="h-3.5 w-3.5 shrink-0" />
                  Repository
                </a>
                {team.submittedAt && (
                  <span className="text-xs text-slate-500">{formatIst(team.submittedAt)} IST</span>
                )}
              </span>
            ) : (
              <StatusPill tone="neutral">No repository recorded</StatusPill>
            )}
          </DetailRow>
        </dl>

        <h3 className="mt-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Members ({accepted.length})
        </h3>
        <ul className="divide-y divide-slate-100 dark:divide-[#250D11] rounded-lg border border-slate-200 dark:border-[#3D1418]">
          {[...accepted, ...invited].map((m) => (
            <li key={m.email} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-[#FAF6F3] truncate">
                  {m.name}
                  {m.isYou && <span className="ml-1.5 text-xs font-normal text-slate-500">(you)</span>}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.email}</p>
              </div>
              {m.isLead ? (
                <StatusPill tone="info">Lead</StatusPill>
              ) : m.status === 'invited' ? (
                <StatusPill tone="warning">Invite pending</StatusPill>
              ) : (
                <StatusPill tone="neutral">Member</StatusPill>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───────────────────────────── Payments ───────────────────────────── */

function buildReminder(names: string[], payBy: string | null) {
  const deadline = payBy ? ` before ${formatIst(payBy)} IST` : '';
  return [
    `Qiskit Fall Fest Phase 2: please pay the ₹${FLAGSHIP_PASS_FEE_INR} Flagship Pass${deadline}.`,
    `Pay on Easebuzz, then upload your receipt from your own account at ${REGISTRATION_URL} (On-Campus Pass card).`,
    names.length ? `Still pending: ${names.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function TeamPaymentsCard({ status, email }: { status: PassStatusResponse; email: string }) {
  const hackathon = status.hackathon!;
  const phase2 = hackathon.phase2!;
  const payment = phase2.payment!;
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const paidCount = payment.members.filter((m) => m.paid).length;
  const verifiedCount = payment.members.filter((m) => m.verified).length;
  const unpaid = payment.members.filter((m) => !m.isLead && !m.paid);
  const isConfirmed = phase2.stage === 'confirmed';
  const reminder = buildReminder(
    unpaid.map((m) => m.name),
    phase2.payBy
  );

  async function copyReminder() {
    try {
      await navigator.clipboard.writeText(reminder);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  function memberState(m: (typeof payment.members)[number]): { tone: Tone; label: string } {
    if (m.verified) return { tone: 'success', label: 'Verified' };
    if (m.paid) return { tone: 'warning', label: 'Submitted, under review' };
    if (m.isLead && !payment.allOthersPaid) return { tone: 'neutral', label: 'Pays last' };
    return { tone: 'danger', label: 'Not paid' };
  }

  return (
    <Card
      title="Team Flagship payments"
      description={`₹${FLAGSHIP_PASS_FEE_INR} per member. Teammates pay first; the lead pays last to confirm the desk.`}
      action={
        isConfirmed ? (
          <StatusPill tone="success">Desk confirmed</StatusPill>
        ) : phase2.payBy ? (
          <StatusPill tone={Date.parse(phase2.payBy) - now < 6 * 3_600_000 ? 'danger' : 'warning'}>
            Due {timeLeft(phase2.payBy, now)}
          </StatusPill>
        ) : (
          <StatusPill tone="neutral">Link not published yet</StatusPill>
        )
      }
    >
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-900 dark:text-[#FAF6F3]">
            {paidCount} of {payment.members.length} paid
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{verifiedCount} verified</span>
        </div>
        <ProgressBar value={paidCount} max={payment.members.length} tone={paidCount === payment.members.length ? 'success' : 'info'} />
        {phase2.payBy && !isConfirmed && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Deadline: {formatIst(phase2.payBy)} IST</p>
        )}
        {!phase2.paymentLinkPublished && (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Payment opens when the link is published ({phase2.paymentLinkExpectedLabel}). Your deadline starts then.
          </p>
        )}
      </div>

      <ul className="mt-4 divide-y divide-slate-100 dark:divide-[#250D11] rounded-lg border border-slate-200 dark:border-[#3D1418]">
        {payment.members.map((m) => {
          const s = memberState(m);
          return (
            <li key={m.email} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-[#FAF6F3] truncate">
                  {m.name}
                  {m.email === email && <span className="ml-1.5 text-xs font-normal text-slate-500">(you)</span>}
                  {m.isLead && <span className="ml-1.5 text-xs font-normal text-slate-500">Lead</span>}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.email}</p>
              </div>
              <StatusPill tone={s.tone}>{s.label}</StatusPill>
            </li>
          );
        })}
      </ul>

      {hackathon.isLead && phase2.paymentLinkPublished && !isConfirmed && unpaid.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-3.5 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Remind teammates who have not paid</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{reminder}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyReminder} className={buttonStyles.secondary}>
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy message'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(reminder)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.secondary}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Share on WhatsApp
            </a>
          </div>
        </div>
      )}

      {!isConfirmed && phase2.paymentLinkPublished && (
        <div className="mt-4">
          <Link href={PASS_HREF} className={buttonStyles.primary}>
            <Wallet className="h-4 w-4" />
            Go to Flagship Pass payment
          </Link>
        </div>
      )}
    </Card>
  );
}

function passTone(statusValue: string): { tone: Tone; label: string } {
  if (statusValue === 'verified') return { tone: 'success', label: 'Verified' };
  if (statusValue === 'rejected') return { tone: 'danger', label: 'Not accepted' };
  return { tone: 'warning', label: 'Under review' };
}

function PaymentRow({
  title,
  amount,
  txn,
  date,
  state,
  note,
  receiptUrl,
  action,
}: {
  title: string;
  amount: number;
  txn: string;
  date: string;
  state: { tone: Tone; label: string };
  note?: string | null;
  receiptUrl?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <li className="py-3.5 first:pt-0 last:pb-0 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ₹{Number(amount).toLocaleString('en-IN')} · Submitted {formatIst(date)} IST
          </p>
        </div>
        <StatusPill tone={state.tone}>{state.label}</StatusPill>
      </div>
      <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">Transaction ID: {txn}</p>
      {note && (
        <p
          className={clsx(
            'text-xs rounded-md px-2.5 py-2',
            state.tone === 'danger'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200'
              : 'bg-slate-50 text-slate-700 dark:bg-[#1C0A0D] dark:text-slate-300'
          )}
        >
          {note}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5]"
          >
            <Receipt className="h-3.5 w-3.5" />
            View receipt
          </a>
        )}
        {action}
      </div>
    </li>
  );
}

export function PaymentsSection({ overview, status }: { overview: ProfileOverview; status?: PassStatusResponse }) {
  const pass = status?.pass;
  const cert = overview.certificate.payment;
  const phase2 = status?.hackathon?.phase2;
  const showTeam = Boolean(phase2?.payment && ['invited', 'accepted', 'confirmed'].includes(phase2.stage));

  return (
    <div className="space-y-4">
      {showTeam && status && <TeamPaymentsCard status={status} email={overview.profile.email} />}

      <Card title="Your payments" description="Every payment you have submitted on the portal and where it stands.">
        {!pass && !cert ? (
          <EmptyState icon={Wallet} title="No payments submitted">
            The online programme is free. Payments apply only to the on-campus pass (26–30 October) and the optional
            certificate.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-[#250D11]">
            {pass && (
              <PaymentRow
                title={passTierLabel(pass.pass_tier)}
                amount={pass.amount_inr}
                txn={pass.transaction_reference}
                date={pass.created_at}
                state={passTone(pass.status)}
                note={pass.status === 'rejected' ? pass.admin_notes || 'The receipt could not be matched.' : null}
                receiptUrl={pass.receipt_url}
                action={
                  <Link
                    href={PASS_HREF}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline"
                  >
                    {pass.status === 'rejected' ? 'Submit again' : 'View pass and QR code'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
            )}
            {cert && (
              <PaymentRow
                title="Masterclass certificate"
                amount={cert.amount_inr}
                txn={cert.transaction_reference}
                date={cert.created_at}
                state={
                  cert.status === 'verified' && cert.delivered_at
                    ? { tone: 'success', label: 'Delivered' }
                    : passTone(cert.status === 'pending_verification' ? 'claimed_provisional' : cert.status)
                }
                note={
                  cert.status === 'rejected'
                    ? cert.admin_notes || 'The receipt could not be matched.'
                    : cert.delivery_mode === 'email'
                      ? 'Delivery: by email.'
                      : cert.delivery_mode === 'ceremony'
                        ? 'Delivery: collect in person at the valedictory ceremony.'
                        : null
                }
                receiptUrl={cert.receipt_url}
                action={
                  <button
                    type="button"
                    onClick={openCertificateModal}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline cursor-pointer"
                  >
                    {cert.status === 'rejected' ? 'Submit again' : 'Open certificate'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
            )}
          </ul>
        )}
      </Card>

      <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
        Receipts are matched with Easebuzz records by the organizing team, usually within a day. Payment questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}

/* ───────────────────────────── Activity ───────────────────────────── */

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs',
        done ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'
      )}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export function CertificateCard({ overview }: { overview: ProfileOverview }) {
  const c = overview.certificate;
  const tasksDone = c.sessionsCompleted + c.quizzesPassed;
  const tasksTotal = c.totalSessions * 2;

  let state: { tone: Tone; label: string };
  if (c.alreadyIssued) state = { tone: 'success', label: 'Issued' };
  else if (c.payment?.status === 'pending_verification') state = { tone: 'warning', label: 'Payment under review' };
  else if (c.payment?.status === 'rejected') state = { tone: 'danger', label: 'Payment not accepted' };
  else if (c.eligible) state = { tone: 'info', label: 'Unlocked' };
  else state = { tone: 'neutral', label: `${tasksDone} of ${tasksTotal} tasks` };

  return (
    <Card
      title="Masterclass certificate"
      description="Optional ₹99 verified certificate after all lectures and quizzes."
      action={<StatusPill tone={state.tone}>{state.label}</StatusPill>}
    >
      {!c.alreadyIssued && (
        <div className="space-y-1.5 mb-4">
          <ProgressBar value={tasksDone} max={tasksTotal} tone={c.eligible ? 'success' : 'info'} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {c.sessionsCompleted}/{c.totalSessions} lectures watched · {c.quizzesPassed}/{c.totalSessions} quizzes passed
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {c.alreadyIssued && c.issued ? (
          <>
            <Link href={`/verify-certificate/${c.issued.serialNumber}`} className={buttonStyles.primary}>
              <Award className="h-4 w-4" />
              View certificate
            </Link>
            <span className="self-center font-mono text-xs text-slate-500">Serial {c.issued.serialNumber}</span>
          </>
        ) : (
          <button
            type="button"
            onClick={openCertificateModal}
            className={c.eligible && !c.payment ? buttonStyles.primary : buttonStyles.secondary}
          >
            <Award className="h-4 w-4" />
            {c.eligible && !c.payment ? 'Claim certificate' : 'Check requirements'}
          </button>
        )}
      </div>
    </Card>
  );
}

export function ActivitySection({ overview }: { overview: ProfileOverview }) {
  const { sessions, competitions, coding } = overview.activity;

  return (
    <div className="space-y-4">
      <Card
        title="Masterclasses"
        description="Lecture and quiz completion. Recordings stay available."
        action={
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {sessions.filter((s) => s.videoCompleted && s.quizPassed).length} of {sessions.length} complete
          </span>
        }
      >
        <ul className="divide-y divide-slate-100 dark:divide-[#250D11] -my-2">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-3">
              <Link
                href={`/learning/session/${s.id}`}
                className="group min-w-0 flex-1 flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200 hover:text-burgundy dark:hover:text-[#E89BA5]"
              >
                <PlayCircle className="h-4 w-4 mt-0.5 shrink-0 text-slate-400 group-hover:text-burgundy dark:group-hover:text-[#E89BA5]" />
                <span className="leading-snug">{s.title}</span>
              </Link>
              <div className="flex items-center gap-3 pl-6 sm:pl-0 shrink-0">
                <Check done={s.videoCompleted} label="Lecture" />
                <Check done={s.quizPassed} label={s.quizPassed && s.quizScore != null ? `Quiz ${s.quizScore}%` : 'Quiz'} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Creative competitions" description="Submissions closed on 17 October.">
          <ul className="space-y-2.5">
            {competitions.map((c) => (
              <li key={c.type} className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <Trophy className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{c.title}</span>
                </div>
                {c.submitted ? (
                  c.submissionUrl ? (
                    <a href={c.submissionUrl} target="_blank" rel="noopener noreferrer" title={`Submitted ${formatIst(c.submittedAt)} IST`}>
                      <StatusPill tone="success">
                        Submitted
                        <ExternalLink className="h-3 w-3" />
                      </StatusPill>
                    </a>
                  ) : (
                    <StatusPill tone="success">Submitted</StatusPill>
                  )
                ) : (
                  <StatusPill tone="neutral">Not submitted</StatusPill>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Qiskit coding challenge"
          action={
            <Link href="/learning/qiskit-challenge" className={buttonStyles.ghost}>
              <Terminal className="h-3.5 w-3.5" />
              Open
            </Link>
          }
        >
          {coding.attempts === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No submissions recorded.</p>
          ) : (
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 dark:bg-[#1C0A0D] p-3">
                <dt className="text-[11px] text-slate-500 dark:text-slate-400">Points</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">
                  {coding.points}
                  <span className="text-xs font-normal text-slate-500">/{coding.maxPoints}</span>
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-[#1C0A0D] p-3">
                <dt className="text-[11px] text-slate-500 dark:text-slate-400">Solved</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">
                  {coding.problemsSolved}
                  <span className="text-xs font-normal text-slate-500">/{coding.totalProblems}</span>
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-[#1C0A0D] p-3">
                <dt className="text-[11px] text-slate-500 dark:text-slate-400">Attempts</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{coding.attempts}</dd>
              </div>
            </dl>
          )}
        </Card>
      </div>

      <CertificateCard overview={overview} />
    </div>
  );
}

/* ───────────────────────────── Account ───────────────────────────── */

export function AccountSection({ overview, onNameSaved }: { overview: ProfileOverview; onNameSaved: (name: string) => void }) {
  const p = overview.profile;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.fullName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, ' ');
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: trimmed }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not update your name.');
      const { invalidateClientSessionCache } = await import('@/lib/session-client');
      invalidateClientSessionCache();
      window.dispatchEvent(new CustomEvent('qff_auth_change', { detail: json.session }));
      onNameSaved(trimmed);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Could not update your name.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
      window.dispatchEvent(new CustomEvent('qff_auth_change', { detail: null }));
    } finally {
      window.location.href = '/learning';
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Account details" description="Your name appears on your pass, team roster and certificate.">
        <dl className="divide-y divide-slate-100 dark:divide-[#250D11] -my-2">
          <DetailRow label="Full name">
            {editing ? (
              <form onSubmit={save} className="flex flex-col sm:flex-row gap-2 w-full">
                <label htmlFor="profile-full-name" className="sr-only">
                  Full name
                </label>
                <input
                  id="profile-full-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={70}
                  autoFocus
                  autoComplete="name"
                  className="flex-1 min-w-0 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/40"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} className={buttonStyles.primary}>
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditing(false);
                      setName(p.fullName);
                      setError('');
                    }}
                    className={buttonStyles.secondary}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium">{p.fullName}</span>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline cursor-pointer"
                >
                  Edit
                </button>
                {saved && <span className="text-xs text-emerald-700 dark:text-emerald-300">Saved</span>}
              </span>
            )}
            {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-300">{error}</p>}
          </DetailRow>
          <DetailRow label="Sign-in email">
            <span className="break-all">{p.email}</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Linked to your Google sign-in. It cannot be changed.</span>
          </DetailRow>
          <DetailRow label="Institution">{p.institution || <span className="text-slate-400">Not provided</span>}</DetailRow>
          {p.yearOfStudy && <DetailRow label="Year of study">{p.yearOfStudy}</DetailRow>}
          <DetailRow label="Phone">{p.phone || <span className="text-slate-400">Not provided</span>}</DetailRow>
          {p.registeredAt && <DetailRow label="Registered on">{formatIst(p.registeredAt, false)}</DetailRow>}
        </dl>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          To correct your institution or phone, write to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>{' '}
          from your sign-in email.
        </p>
      </Card>

      <Card title="Help">
        <div className="flex flex-col sm:flex-row gap-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className={buttonStyles.secondary}>
            <Mail className="h-4 w-4" />
            Email the organizers
          </a>
          <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={buttonStyles.secondary}>
            <MessageCircle className="h-4 w-4" />
            WhatsApp community
          </a>
          <Link href="/faqs" className={buttonStyles.secondary}>
            <FileText className="h-4 w-4" />
            FAQs
          </Link>
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={signOut}
          className={clsx(buttonStyles.secondary, 'hover:text-rose-700 hover:border-rose-200 dark:hover:text-rose-300')}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
