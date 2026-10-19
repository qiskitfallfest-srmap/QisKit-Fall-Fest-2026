'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  RotateCw,
  Search,
  Settings2,
  Copy,
  Layers,
  X,
  Filter as FilterIcon,
} from 'lucide-react';
import type { AdminPhase2Data, AdminPhase2Member, AdminPhase2Row, AdminPhase2Stage } from '@/app/api/admin/phase2/route';
import { PROBLEM_STATEMENTS } from '@/data/learning/problem-statements';

const PS_TITLE_MAP = new Map(PROBLEM_STATEMENTS.map((ps) => [ps.id, ps.title]));

type Filter = 'undecided' | 'invited' | 'accepted' | 'confirmed' | 'verify' | 'waitlisted' | 'not_selected' | 'closed' | 'all';

const FILTERS: { key: Filter; label: string; match: (r: AdminPhase2Row) => boolean }[] = [
  { key: 'undecided', label: 'To decide', match: (r) => r.stage === 'undecided' },
  { key: 'invited', label: 'Awaiting response', match: (r) => r.stage === 'invited' },
  { key: 'accepted', label: 'Accepted, paying', match: (r) => r.stage === 'accepted' },
  { key: 'confirmed', label: 'Confirmed', match: (r) => r.stage === 'confirmed' },
  { key: 'verify', label: 'Receipts to verify', match: (r) => (r.payment?.pending || 0) > 0 },
  { key: 'waitlisted', label: 'Waitlisted', match: (r) => r.stage === 'waitlisted' },
  { key: 'not_selected', label: 'Not selected', match: (r) => r.stage === 'not_selected' },
  { key: 'closed', label: 'Declined / expired', match: (r) => ['declined', 'expired', 'revoked'].includes(r.stage) },
  { key: 'all', label: 'All teams', match: () => true },
];

const STAGE_LABEL: Record<AdminPhase2Stage, string> = {
  undecided: 'Not released',
  invited: 'Invited',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  declined: 'Declined',
  expired: 'Expired',
  revoked: 'Revoked',
  waitlisted: 'Waitlisted',
  not_selected: 'Not selected',
  no_submission: 'No submission',
};

const STAGE_TONE: Record<AdminPhase2Stage, string> = {
  undecided: 'bg-slate-100 text-slate-600 dark:bg-[#1C0A0D] dark:text-slate-300',
  invited: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  accepted: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  declined: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
  expired: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
  revoked: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
  waitlisted: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300',
  not_selected: 'bg-slate-100 text-slate-600 dark:bg-[#1C0A0D] dark:text-slate-300',
  no_submission: 'bg-slate-100 text-slate-500 dark:bg-[#1C0A0D] dark:text-slate-400',
};

const JURY_LABEL: Record<string, string> = {
  shortlisted: 'Jury: shortlist',
  finalist: 'Jury: shortlist',
  under_review: 'Jury: waitlist',
  needs_discussion: 'Jury: waitlist',
  rejected: 'Jury: reject',
  pending: 'Jury: pending',
};

const CLOSE_REASON: Record<string, string> = {
  no_response: 'Lead did not respond in time',
  payment_incomplete: 'Payments not completed in time',
  declined_by_lead: 'Declined by team lead',
  withdrawn_by_lead: 'Withdrawn by lead after accepting',
  revoked_by_admin: 'Revoked by admin',
};

function formatIst(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeLeft(iso: string | null | undefined, now: number) {
  if (!iso) return '';
  const ms = Date.parse(iso) - now;
  if (ms <= 0) return 'overdue';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

const btn =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const btnPrimary = `${btn} bg-burgundy hover:bg-burgundy-deep text-white`;
const btnSecondary = `${btn} border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]`;
const btnDanger = `${btn} border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30`;
const inputCls =
  'px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#100405] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/30';

function Stat({ label, value, detail }: { label: string; value: React.ReactNode; detail?: string }) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-[#150709]">
      <dt className="text-[11px] text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{value}</dd>
      {detail && <p className="text-[11px] text-slate-500 dark:text-slate-400">{detail}</p>}
    </div>
  );
}

const CLAIM_LABEL: Record<string, { text: string; tone: string }> = {
  claimed_provisional: { text: 'Submitted, to verify', tone: 'text-amber-700 dark:text-amber-300' },
  verified: { text: 'Verified', tone: 'text-emerald-700 dark:text-emerald-300' },
  rejected: { text: 'Rejected', tone: 'text-rose-600 dark:text-rose-300' },
};

function MemberPayments({
  row,
  busy,
  onReview,
}: {
  row: AdminPhase2Row;
  busy: boolean;
  onReview: (member: AdminPhase2Member, action: 'approve' | 'reject' | 'reopen') => void;
}) {
  const paying = Boolean(row.payment);
  return (
    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-[#3D1418] space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Members ({row.members.length})
          {row.payment && (
            <span className="ml-2 font-normal text-slate-500 dark:text-slate-400 tabular-nums">
              {row.payment.paid}/{row.payment.total} paid · {row.payment.verified} verified · {row.payment.pending} to verify
            </span>
          )}
        </p>
        {!paying && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Payments open after the team lead accepts.</p>
        )}
      </div>
      {row.stage === 'confirmed' && row.payment && row.payment.rejected > 0 && (
        <p className="text-[11px] text-rose-700 dark:text-rose-300">
          Desk is confirmed but a receipt was rejected. The member can resubmit from their pass card.
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709]">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3D1418]">
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Role</th>
              {paying && (
                <>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Transaction ID</th>
                  <th className="px-3 py-2">Receipt</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {row.members.map((m) => {
              const claim = m.claim;
              const label = claim ? CLAIM_LABEL[claim.status] || { text: claim.status, tone: 'text-slate-500' } : null;
              return (
                <tr key={m.email} className="border-b last:border-b-0 border-slate-100 dark:border-[#250D11] align-top">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900 dark:text-[#FAF6F3]">{m.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.email}</p>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{m.isLead ? 'Lead (pays last)' : 'Member'}</td>
                  {paying && (
                    <>
                      <td className="px-3 py-2">
                        {claim && label ? (
                          <>
                            <p className={clsx('font-semibold', label.tone)}>{label.text}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              ₹{claim.amountInr} · {formatIst(claim.submittedAt)}
                            </p>
                            {claim.status === 'rejected' && claim.adminNotes && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-300">{claim.adminNotes}</p>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">Not paid</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                        {claim ? (
                          <span className="inline-flex items-center gap-1">
                            {claim.transactionReference}
                            <button
                              type="button"
                              aria-label="Copy transaction ID"
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              onClick={() => navigator.clipboard?.writeText(claim.transactionReference).catch(() => {})}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </span>
                        ) : (
                          '–'
                        )}
                        {claim?.bankReference && <p className="text-[10px] text-slate-500">UTR {claim.bankReference}</p>}
                      </td>
                      <td className="px-3 py-2">
                        {claim?.receiptUrl ? (
                          <a
                            href={claim.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-burgundy dark:text-[#E89BA5] hover:underline"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {claim && (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {claim.status !== 'verified' && (
                              <button type="button" className={btnPrimary} disabled={busy} onClick={() => onReview(m, 'approve')}>
                                Approve
                              </button>
                            )}
                            {claim.status !== 'rejected' && !claim.checkedIn && (
                              <button type="button" className={btnDanger} disabled={busy} onClick={() => onReview(m, 'reject')}>
                                Reject
                              </button>
                            )}
                            {claim.status !== 'claimed_provisional' && !claim.checkedIn && (
                              <button
                                type="button"
                                className={`${btn} text-slate-500 hover:text-slate-800`}
                                disabled={busy}
                                onClick={() => onReview(m, 'reopen')}
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPhase2View() {
  const [data, setData] = useState<AdminPhase2Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState<Filter>('undecided');
  const [selectedVertical, setSelectedVertical] = useState<string>('all');
  const [selectedPS, setSelectedPS] = useState<string>('all');
  const [showInsights, setShowInsights] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { score: string; feedback: string }>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ responseHours: '24', paymentHours: '24', autoPromote: true });
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/phase2', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setData(json.data);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to load Phase 2 data');
    } finally {
      setLoading(false);
    }
  }, []);

  // The GET also expires overdue offers and invites replacements, so polling keeps the queue moving
  useEffect(() => {
    load();
    const poll = setInterval(load, 60_000);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  useEffect(() => {
    if (!data) return;
    setSettings({
      responseHours: String(data.config.responseHours),
      paymentHours: String(data.config.paymentHours),
      autoPromote: data.config.autoPromote,
    });
  }, [data?.config.responseHours, data?.config.paymentHours, data?.config.autoPromote]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(payload: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/phase2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Action failed');
      setData(json.data);
      const failures = (json.results || []).filter((r: any) => !r.ok);
      const promotions = (json.results || []).filter((r: any) => r.ok && r.message);
      if (failures.length) {
        const names = failures
          .map((f: any) => `${json.data.rows.find((r: AdminPhase2Row) => r.teamId === f.teamId)?.name || f.teamId}: ${f.message}`)
          .join('; ');
        setError(names);
      }
      setNotice([successMessage, ...promotions.map((p: any) => p.message)].join(' '));
      setSelected(new Set());
      return true;
    } catch (err: any) {
      setError(err?.message || 'Action failed');
      return false;
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => data?.rows || [], [data]);
  const rankById = useMemo(() => new Map(rows.map((r, i) => [r.teamId, i + 1])), [rows]);

  const availableVerticals = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.vertical && r.vertical !== 'Unspecified') set.add(r.vertical);
    });
    return Array.from(set).sort();
  }, [rows]);

  const availablePS = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (selectedVertical === 'all' || r.vertical === selectedVertical) {
        if (r.problemStatementId && r.problemStatementId !== 'Unspecified') set.add(r.problemStatementId);
      }
    });
    return Array.from(set).sort();
  }, [rows, selectedVertical]);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        f.match(r) &&
        (selectedVertical === 'all' || r.vertical === selectedVertical) &&
        (selectedPS === 'all' || r.problemStatementId === selectedPS) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.leadEmail.toLowerCase().includes(q) ||
          r.leadName?.toLowerCase().includes(q) ||
          r.vertical?.toLowerCase().includes(q) ||
          r.problemStatementId?.toLowerCase().includes(q))
    );
  }, [rows, filter, query, selectedVertical, selectedPS]);

  const selectedRows = rows.filter((r) => selected.has(r.teamId));
  const canDecide = (r: AdminPhase2Row) => !r.offer || ['declined', 'expired', 'revoked'].includes(r.offer.status);

  function toggle(teamId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  }

  function draftFor(r: AdminPhase2Row) {
    return drafts[r.teamId] || { score: r.score != null ? String(r.score) : '', feedback: r.feedback };
  }

  function invite(teamIds: string[]) {
    if (!data || !teamIds.length) return;
    const byTrack = { internal: 0, external: 0 };
    rows.filter((r) => teamIds.includes(r.teamId)).forEach((r) => (byTrack[r.track] += 1));
    const over = (['internal', 'external'] as const).filter(
      (t) => data.summary.desks[t].active + byTrack[t] > data.summary.desks[t].quota
    );
    const lines = [
      `Invite ${teamIds.length} team(s) to Phase 2?`,
      `The lead gets ${data.config.responseHours}h to accept, then the team has ${data.config.paymentHours}h to pay.`,
      ...over.map((t) => `Warning: this exceeds the ${t} desk quota (${data.summary.desks[t].quota}).`),
    ];
    if (!window.confirm(lines.join('\n'))) return;
    act({ action: 'invite', teamIds }, `Invited ${teamIds.length} team(s).`);
  }

  function decide(action: 'waitlist' | 'reject', teamIds: string[]) {
    if (!teamIds.length) return;
    const verb = action === 'reject' ? 'Mark as not selected and release to' : 'Move to the waiting room and release to';
    if (!window.confirm(`${verb} ${teamIds.length} team(s)? Teams see this immediately.`)) return;
    act({ action, teamIds }, action === 'reject' ? 'Released as not selected.' : 'Released as waitlisted.');
  }

  async function reviewClaim(member: AdminPhase2Member, action: 'approve' | 'reject' | 'reopen') {
    if (!member.claim) return;
    let notes = '';
    if (action === 'reject') {
      const reason = window.prompt(
        `Reject the receipt from ${member.name}? Enter the reason; the participant sees it and can resubmit.`,
        'Transaction ID does not match an Easebuzz payment'
      );
      if (!reason || !reason.trim()) return;
      notes = reason.trim();
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pass', id: member.claim.id, action, notes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Review failed');
      setNotice(
        action === 'approve'
          ? `Verified ${member.name}.`
          : action === 'reject'
            ? `Rejected the receipt from ${member.name}.`
            : `Reopened the receipt from ${member.name}.`
      );
      await load();
    } catch (err: any) {
      setError(err?.message || 'Review failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading Phase 2 results...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-rose-700 dark:text-rose-300">
        {error || 'Could not load Phase 2 data.'}{' '}
        <button type="button" onClick={load} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-slate-900 dark:text-[#FAF6F3]">Phase 2 Results & Waiting Room</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Release results team by team. Declined or expired desks go to the next waitlisted team in the same track
            {data.config.autoPromote && !data.config.closedAt ? ' automatically.' : ' (auto-promotion is off).'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={btnSecondary} onClick={() => setShowSettings((v) => !v)}>
            <Settings2 className="w-3.5 h-3.5" /> Settings
          </button>
          <button type="button" className={btnSecondary} onClick={() => act({ action: 'sweep' }, 'Refreshed.')} disabled={busy}>
            <RotateCw className={clsx('w-3.5 h-3.5', busy && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {!data.gatewayPublished && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            The Flagship Pass payment link is not published. Teams that accept cannot pay until you set it under
            Hackathon Teams &gt; Flagship payment. Their payment timer still runs.
          </span>
        </div>
      )}

      {data.config.closedAt && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-[#3D1418] dark:bg-[#1C0A0D] text-xs text-slate-700 dark:text-slate-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Waiting room closed on {formatIst(data.config.closedAt)} IST. Remaining waitlisted teams now see &ldquo;not
            selected&rdquo; and can buy the General Pass. No automatic invitations are sent.
          </span>
        </div>
      )}

      {/* Counters */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px rounded-xl overflow-hidden border border-slate-200 dark:border-[#3D1418] bg-slate-200 dark:bg-[#3D1418]">
        <Stat label="Invited (dispatched)" value={s.dispatched} detail="all invitations sent" />
        <Stat label="Awaiting response" value={s.awaitingResponse} />
        <Stat label="Accepted" value={s.accepted} detail={`${s.accepted - s.confirmed} still paying`} />
        <Stat label="Fully paid teams" value={s.confirmed} />
        <Stat label="Member payments" value={`${s.membersPaid}/${s.membersToPay}`} detail={`${s.receiptsToVerify} receipts to verify`} />
        <Stat label="Not selected (released)" value={s.notSelectedReleased} />
        <Stat
          label="Waitlist"
          value={s.waitlistRemaining.internal + s.waitlistRemaining.external}
          detail={`${s.waitlistRemaining.internal} int · ${s.waitlistRemaining.external} ext left`}
        />
        <Stat label="Declined / expired" value={s.declined + s.expired + s.revoked} detail={`${s.declined} declined · ${s.expired} expired`} />
      </dl>

      {/* Desk occupancy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['internal', 'external'] as const).map((t) => {
          const d = s.desks[t];
          const pct = Math.min(100, (d.active / Math.max(1, d.quota)) * 100);
          return (
            <div key={t} className="p-3 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709]">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t === 'internal' ? 'Internal (SRM AP)' : 'External'} desks
                </span>
                <span className={clsx('tabular-nums', d.active > d.quota ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400')}>
                  {d.active} / {d.quota} held
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-[#1C0A0D] overflow-hidden">
                <div className={clsx('h-full', d.active > d.quota ? 'bg-rose-500' : 'bg-burgundy')} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">Held = invited, accepted or confirmed.</p>
            </div>
          );
        })}
      </div>

      {/* Domain Track & Problem Statement Insights Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-[#250D11] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
              Domain Track & Problem Statement Breakdown
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({s.dispatched} Phase 2 offered teams)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(selectedVertical !== 'all' || selectedPS !== 'all') && (
              <button
                type="button"
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                onClick={() => { setSelectedVertical('all'); setSelectedPS('all'); }}
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setShowInsights((v) => !v)}
            >
              {showInsights ? 'Hide Breakdown' : 'Show Breakdown'}
            </button>
          </div>
        </div>

        {showInsights && (
          <div className="space-y-4">
            {/* Domain Verticals */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Domain Verticals (Click to filter table):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {Object.entries(s.verticalsBreakdown || {}).sort((a, b) => b[1].total - a[1].total).map(([vert, counts]) => {
                  const isSelected = selectedVertical === vert;
                  return (
                    <button
                      key={vert}
                      type="button"
                      onClick={() => {
                        setSelectedVertical(isSelected ? 'all' : vert);
                        setSelectedPS('all');
                      }}
                      className={clsx(
                        'p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1',
                        isSelected
                          ? 'border-burgundy bg-burgundy/5 dark:bg-burgundy/20 ring-1 ring-burgundy'
                          : 'border-slate-200 dark:border-[#3D1418] hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#1C0A0D]'
                      )}
                    >
                      <p className="font-semibold text-xs text-slate-900 dark:text-[#FAF6F3] truncate" title={vert}>
                        {vert}
                      </p>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-[#FAF6F3] tabular-nums">
                          {counts.total} teams
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {counts.participants} members
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">{counts.accepted} accepted</span>
                        <span>·</span>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">{counts.invited} invited</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Statements */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#250D11]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Problem Statements Chosen ({Object.keys(s.problemStatementsBreakdown || {}).length} unique PS):
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(s.problemStatementsBreakdown || {})
                  .filter(([_, info]) => selectedVertical === 'all' || info.vertical === selectedVertical)
                  .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
                  .map(([ps, info]) => {
                    const isSelected = selectedPS === ps;
                    return (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => setSelectedPS(isSelected ? 'all' : ps)}
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-burgundy text-white border-burgundy'
                            : 'bg-white dark:bg-[#100405] border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                        )}
                        title={PS_TITLE_MAP.get(ps) || ps}
                      >
                        <span className="font-mono font-bold">{ps}</span>
                        <span className="opacity-75 tabular-nums">({info.total}t · {info.participants}p)</span>
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          info.accepted > 0 ? 'bg-emerald-500' : 'bg-blue-500'
                        )} />
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="block">Hours to accept</span>
              <input type="number" min={1} max={240} className={clsx(inputCls, 'w-24')} value={settings.responseHours}
                onChange={(e) => setSettings((v) => ({ ...v, responseHours: e.target.value }))} />
            </label>
            <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="block">Hours to pay after accepting</span>
              <input type="number" min={1} max={240} className={clsx(inputCls, 'w-24')} value={settings.paymentHours}
                onChange={(e) => setSettings((v) => ({ ...v, paymentHours: e.target.value }))} />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 pb-2 cursor-pointer">
              <input type="checkbox" checked={settings.autoPromote}
                onChange={(e) => setSettings((v) => ({ ...v, autoPromote: e.target.checked }))} />
              Invite next waitlisted team automatically
            </label>
            <button type="button" className={btnPrimary} disabled={busy}
              onClick={() => act({ action: 'settings', ...settings }, 'Settings saved. New times apply to new invitations.')}>
              Save settings
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#250D11]">
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Close the waiting room once all desks are confirmed. Remaining waitlisted teams are then shown &ldquo;not selected&rdquo;
              and can buy the General Pass.
            </p>
            {data.config.closedAt ? (
              <button type="button" className={btnSecondary} disabled={busy}
                onClick={() => act({ action: 'reopen_waiting_room' }, 'Waiting room reopened.')}>
                Reopen waiting room
              </button>
            ) : (
              <button type="button" className={btnDanger} disabled={busy}
                onClick={() =>
                  window.confirm('Close the waiting room? Waitlisted teams will see "not selected".') &&
                  act({ action: 'close_waiting_room' }, 'Waiting room closed.')
                }>
                Close waiting room
              </button>
            )}
          </div>
        </div>
      )}

      {(error || notice) && (
        <div className={clsx('p-3 rounded-lg text-xs border',
          error ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200')}>
          {error || notice}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const n = rows.filter(f.match).length;
          return (
            <button key={f.key} type="button" onClick={() => { setFilter(f.key); setSelected(new Set()); }}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-full border cursor-pointer',
                filter === f.key
                  ? 'bg-burgundy border-burgundy text-white'
                  : 'border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]')}>
              {f.label} <span className="tabular-nums opacity-80">{n}</span>
            </button>
          );
        })}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <select
            className={clsx(inputCls, 'text-xs py-1.5 cursor-pointer max-w-[160px]')}
            value={selectedVertical}
            onChange={(e) => { setSelectedVertical(e.target.value); setSelectedPS('all'); }}
          >
            <option value="all">All Tracks</option>
            {availableVerticals.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select
            className={clsx(inputCls, 'text-xs py-1.5 cursor-pointer max-w-[130px]')}
            value={selectedPS}
            onChange={(e) => setSelectedPS(e.target.value)}
          >
            <option value="all">All PS</option>
            {availablePS.map((ps) => (
              <option key={ps} value={ps}>{ps}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={clsx(inputCls, 'pl-8 w-48 text-xs py-1.5')} placeholder="Search team, lead, track..." value={query}
              onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedRows.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-sm">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 mr-2">{selectedRows.length} selected</span>
          <button type="button" className={btnPrimary} disabled={busy || !selectedRows.every(canDecide)}
            onClick={() => invite(selectedRows.map((r) => r.teamId))}>Invite to Phase 2</button>
          <button type="button" className={btnSecondary} disabled={busy || !selectedRows.every(canDecide)}
            onClick={() => decide('waitlist', selectedRows.map((r) => r.teamId))}>Move to waiting room</button>
          <button type="button" className={btnDanger} disabled={busy || !selectedRows.every(canDecide)}
            onClick={() => decide('reject', selectedRows.map((r) => r.teamId))}>Not selected</button>
          <button type="button" className={`${btn} text-slate-500`} onClick={() => setSelected(new Set())}>Clear</button>
          {!selectedRows.every(canDecide) && (
            <span className="text-[11px] text-slate-500">Some selected teams hold an active invitation.</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-[#3D1418] overflow-x-auto bg-white dark:bg-[#150709]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3D1418]">
              <th className="p-3 w-8">
                <input type="checkbox" aria-label="Select all visible"
                  checked={visible.length > 0 && visible.every((r) => selected.has(r.teamId))}
                  onChange={(e) => setSelected(e.target.checked ? new Set(visible.map((r) => r.teamId)) : new Set())} />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Team</th>
              <th className="p-3">Track & Problem Statement</th>
              <th className="p-3 text-right">Score</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-xs text-slate-500">No teams in this view.</td></tr>
            )}
            {visible.map((r) => {
              const isOpen = expanded === r.teamId;
              const draft = draftFor(r);
              const deadline = r.stage === 'invited' ? r.offer?.respond_by : r.stage === 'accepted' ? r.offer?.pay_by : null;
              return (
                <React.Fragment key={r.teamId}>
                  <tr className={clsx('border-b border-slate-100 dark:border-[#250D11] hover:bg-slate-50/70 dark:hover:bg-[#1C0A0D]/60', isOpen && 'bg-slate-50 dark:bg-[#1C0A0D]')}>
                    <td className="p-3">
                      <input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.teamId)} onChange={() => toggle(r.teamId)} />
                    </td>
                    <td className="p-3 text-xs tabular-nums text-slate-400">{rankById.get(r.teamId)}</td>
                    <td className="p-3 cursor-pointer" onClick={() => setExpanded(isOpen ? null : r.teamId)}>
                      <p className="font-medium text-slate-900 dark:text-[#FAF6F3]">{r.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.leadName} · {r.membersCount} members</p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-xs text-slate-900 dark:text-[#FAF6F3] block">
                        {r.vertical || 'Unspecified'}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 dark:bg-[#250D11] dark:text-slate-200 border border-slate-200 dark:border-[#3D1418]"
                          title={PS_TITLE_MAP.get(r.problemStatementId) || r.problemStatementId}
                        >
                          {r.problemStatementId}
                        </span>
                        <span
                          className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                            r.track === 'internal'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                          )}
                        >
                          {r.track === 'internal' ? 'SRM AP' : 'External'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right tabular-nums font-medium text-slate-900 dark:text-[#FAF6F3]">{r.score ?? '–'}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={clsx('px-2 py-0.5 rounded-full text-[11px] font-semibold', STAGE_TONE[r.stage])}>{STAGE_LABEL[r.stage]}</span>
                        {r.stage === 'undecided' && r.juryStatus && JURY_LABEL[r.juryStatus] && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{JURY_LABEL[r.juryStatus]}</span>
                        )}
                        {r.payment && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">paid {r.payment.paid}/{r.payment.total}</span>
                        )}
                        {r.payment && r.payment.pending > 0 && (
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 tabular-nums">{r.payment.pending} to verify</span>
                        )}
                        {r.payment && r.payment.rejected > 0 && (
                          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-300 tabular-nums">{r.payment.rejected} rejected</span>
                        )}
                        {deadline && (
                          <span className={clsx('text-[11px] tabular-nums', timeLeft(deadline, now) === 'overdue' ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400')}>
                            {timeLeft(deadline, now)}
                          </span>
                        )}
                        {r.stage === 'accepted' && !r.offer?.pay_by && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">waiting for payment link</span>
                        )}
                        {r.offer?.source === 'auto_promotion' && <span className="text-[11px] text-violet-600 dark:text-violet-300">auto</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <button type="button" aria-label="Details" className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : r.teamId)}>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="border-b border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D]">
                      <td colSpan={7} className="p-4">
                        <div className="space-y-4">
                          {/* Problem Statement Card */}
                          <div className="p-3 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Chosen Problem Statement</span>
                              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-[#250D11] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#3D1418]">
                                {r.problemStatementId}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                              {PS_TITLE_MAP.get(r.problemStatementId) || r.problemStatementId}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Domain Track: <strong className="text-slate-700 dark:text-slate-200">{r.vertical}</strong> · Quota Allocation: <strong className="text-slate-700 dark:text-slate-200">{r.track === 'internal' ? 'SRM University-AP (Internal Desk)' : 'External University Desk'}</strong>
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Score + note */}
                          <div className="space-y-3">
                            <div className="flex items-end gap-3">
                              <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                <span className="block">Score (0–100)</span>
                                <input type="number" min={0} max={100} step="0.01" className={clsx(inputCls, 'w-28')} value={draft.score}
                                  onChange={(e) => setDrafts((d) => ({ ...d, [r.teamId]: { ...draft, score: e.target.value } }))} />
                              </label>
                              {r.repoUrl && (
                                <a href={r.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-burgundy dark:text-[#E89BA5] hover:underline pb-2">
                                  Repository <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <label className="block text-xs text-slate-600 dark:text-slate-300 space-y-1">
                              <span className="block">Comment shown to the team with its result</span>
                              <textarea rows={3} className={clsx(inputCls, 'w-full')} value={draft.feedback} maxLength={2000}
                                placeholder="e.g. Strong idea; the circuit implementation was incomplete and the README lacked results."
                                onChange={(e) => setDrafts((d) => ({ ...d, [r.teamId]: { ...draft, feedback: e.target.value } }))} />
                            </label>
                            <button type="button" className={btnSecondary} disabled={busy}
                              onClick={async () => {
                                const ok = await act({ action: 'save', teamId: r.teamId, score: draft.score, feedback: draft.feedback }, 'Saved.');
                                if (ok) setDrafts((d) => { const n = { ...d }; delete n[r.teamId]; return n; });
                              }}>
                              Save score & comment
                            </button>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Saving does not release anything. The team sees the comment once its result is released.</p>
                          </div>

                          {/* Decision / offer */}
                          <div className="space-y-3">
                            {canDecide(r) ? (
                              <>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Release decision</p>
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" className={btnPrimary} disabled={busy} onClick={() => invite([r.teamId])}>Invite to Phase 2</button>
                                  <button type="button" className={btnSecondary} disabled={busy} onClick={() => decide('waitlist', [r.teamId])}>Move to waiting room</button>
                                  <button type="button" className={btnDanger} disabled={busy} onClick={() => decide('reject', [r.teamId])}>Not selected</button>
                                </div>
                                {r.releasedAt && <p className="text-[11px] text-slate-500">First released {formatIst(r.releasedAt)} IST.</p>}
                              </>
                            ) : null}

                            {r.offer && (
                              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Invitation</p>
                                <ul className="space-y-1">
                                  <li>Invited {formatIst(r.offer.invited_at)} IST {r.offer.source === 'auto_promotion' ? '(auto-promoted from waitlist)' : `by ${r.offer.invited_by}`}</li>
                                  {r.offer.status === 'invited' && <li>Lead must accept by {formatIst(r.offer.respond_by)} IST</li>}
                                  {r.offer.responded_at && r.offer.status !== 'declined' && <li>Accepted {formatIst(r.offer.responded_at)} IST</li>}
                                  {r.offer.status === 'accepted' && (
                                    <li>
                                      {r.offer.pay_by
                                        ? `Payments due ${formatIst(r.offer.pay_by)} IST`
                                        : `Payment window (${r.offer.payment_window_hours}h) starts when the payment link is published`}
                                    </li>
                                  )}
                                  {r.payment && <li>Payments: {r.payment.paid}/{r.payment.total} submitted, {r.payment.verified} verified</li>}
                                  {r.offer.confirmed_at && <li>Confirmed {formatIst(r.offer.confirmed_at)} IST</li>}
                                  {r.offer.close_reason && <li>Closed: {CLOSE_REASON[r.offer.close_reason] || r.offer.close_reason}</li>}
                                  {r.offer.decline_reason && <li>Reason given: &ldquo;{r.offer.decline_reason}&rdquo;</li>}
                                </ul>
                                {(r.offer.status === 'invited' || r.offer.status === 'accepted') && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button type="button" className={btnSecondary} disabled={busy}
                                      onClick={() => act({ action: 'extend', teamId: r.teamId, hours: 12 }, 'Deadline extended by 12 hours.')}>Extend 12h</button>
                                    <button type="button" className={btnSecondary} disabled={busy}
                                      onClick={() => act({ action: 'extend', teamId: r.teamId, hours: 24 }, 'Deadline extended by 24 hours.')}>Extend 24h</button>
                                    <button type="button" className={btnDanger} disabled={busy}
                                      onClick={() =>
                                        window.confirm(`Revoke ${r.name}'s invitation? The desk goes to the next waitlisted team.`) &&
                                        act({ action: 'revoke', teamId: r.teamId }, 'Invitation revoked.')
                                      }>Revoke</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <MemberPayments row={r} busy={busy} onReview={reviewClaim} />
                      </div>
                    </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
