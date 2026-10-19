'use client';

import React, { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { ArrowRight, Loader2, MessageSquare, Plus, Trash2, UserMinus, UserPlus, Users, X } from 'lucide-react';
import {
  EMAIL_RE,
  MIN_MEMBER_REASON_LENGTH,
  QUESTION_CATEGORIES,
  TEAM_SIZE,
  type ParticipantRequest,
  type QuestionCategory,
  type RosterAdd,
} from '@/lib/participant-requests-shared';
import type { ProfileOverview } from '@/hooks/use-profile-overview';
import { Card, EmptyState, StatusPill, buttonStyles, formatIst, type Tone } from './profile-ui';

export const REQUESTS_KEY = '/api/requests';

export interface RequestsResponse {
  success: boolean;
  available: boolean;
  team: { id: string; name: string; isLead: boolean } | null;
  rosterChangesClosed: boolean;
  rosterChangesNote: string | null;
  requests: ParticipantRequest[];
}

const fetcher = async (url: string): Promise<RequestsResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load your requests.');
  return json;
};

export function useParticipantRequests() {
  return useSWR<RequestsResponse>(REQUESTS_KEY, fetcher, { revalidateOnFocus: true, dedupingInterval: 15_000 });
}

// A decision the participant has not looked at yet drives the tab badge
const SEEN_KEY = 'qff_request_decisions_seen';
export const decisionKey = (r: ParticipantRequest) => `${r.id}:${r.status}`;

export function readSeenDecisions(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function markDecisionsSeen(keys: string[]) {
  try {
    const seen = readSeenDecisions();
    keys.forEach((k) => seen.add(k));
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen).slice(-200)));
  } catch {}
}

export function isDecided(r: ParticipantRequest) {
  return r.status === 'approved' || r.status === 'rejected' || r.status === 'answered';
}

const STATUS_VIEW: Record<ParticipantRequest['status'], { tone: Tone; label: string }> = {
  open: { tone: 'warning', label: 'Under review' },
  approved: { tone: 'success', label: 'Approved' },
  rejected: { tone: 'danger', label: 'Not approved' },
  answered: { tone: 'success', label: 'Answered' },
  withdrawn: { tone: 'neutral', label: 'Withdrawn' },
};

const field =
  'w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-burgundy/40';
const labelClass = 'block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1';

async function postJson(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    const err = new Error(json.error || 'Something went wrong.') as Error & { errors?: string[] };
    err.errors = json.errors;
    throw err;
  }
  return json;
}

/* ───────────────────────────── Question form ───────────────────────────── */

function QuestionForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [category, setCategory] = useState<QuestionCategory | ''>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return setError('Choose a topic.');
    if (message.trim().length < 10) return setError('Write a little more so the team can answer properly.');
    setBusy(true);
    setError('');
    try {
      await postJson('/api/requests', 'POST', { kind: 'question', category, subject, message });
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Ask a question" description="The organizing team replies here, usually within a day.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="q-category" className={labelClass}>Topic</label>
          <select id="q-category" value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory)} className={field}>
            <option value="" disabled>Choose a topic</option>
            {(Object.keys(QUESTION_CATEGORIES) as QuestionCategory[]).map((c) => (
              <option key={c} value={c}>{QUESTION_CATEGORIES[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="q-subject" className={labelClass}>Subject (optional)</label>
          <input id="q-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} className={field} />
        </div>
        <div>
          <label htmlFor="q-message" className={labelClass}>Your question</label>
          <textarea
            id="q-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={3000}
            placeholder="Include details that help us answer: team name, transaction ID, dates."
            className={field}
          />
        </div>
        {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className={buttonStyles.primary}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Send question
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className={buttonStyles.secondary}>Cancel</button>
        </div>
      </form>
    </Card>
  );
}

/* ───────────────────────────── Team change form ───────────────────────────── */

interface DraftAdd extends RosterAdd {
  key: number;
  reason: string;
}

/**
 * One request that removes and/or adds members, with a reason per person.
 * Any member can send it; the lead cannot be removed. Nothing changes until the organizers approve.
 */
export function TeamChangeForm({
  overview,
  note,
  onDone,
  onCancel,
}: {
  overview: ProfileOverview;
  note: string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const roster = useMemo(
    () => [...(overview.team?.members || [])].sort((a, b) => Number(b.isLead) - Number(a.isLead)),
    [overview.team]
  );
  const [dropReasons, setDropReasons] = useState<Record<string, string>>({});
  const [adds, setAdds] = useState<DraftAdd[]>([]);
  const [nextKey, setNextKey] = useState(0);
  const [teamNote, setTeamNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMissing, setShowMissing] = useState(false);
  const errorRef = useRef<HTMLUListElement>(null);

  const dropped = roster.filter((m) => m.email in dropReasons);
  const accepted = roster.filter((m) => m.status === 'accepted').length;
  const droppedAccepted = dropped.filter((m) => m.status === 'accepted').length;
  const filledAdds = adds.filter((a) => a.email.trim());
  const finalSize = accepted - droppedAccepted + filledAdds.length;
  const sizeOk = finalSize >= TEAM_SIZE.min && finalSize <= TEAM_SIZE.max;
  const reasonShort = (r: string | undefined) => (r || '').trim().length < MIN_MEMBER_REASON_LENGTH;

  function toggleDrop(email: string) {
    setDropReasons((prev) => {
      const next = { ...prev };
      if (email in next) delete next[email];
      else next[email] = '';
      return next;
    });
  }

  function addRow() {
    setAdds((prev) => [...prev, { key: nextKey, email: '', name: '', institution: '', reason: '' }]);
    setNextKey((k) => k + 1);
    // Focus the new email field once it renders
    setTimeout(() => document.getElementById(`add-email-${nextKey}`)?.focus(), 0);
  }

  function updateAdd(key: number, patch: Partial<DraftAdd>) {
    setAdds((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: string[] = [];
    const rosterEmails = new Set(roster.map((m) => m.email.toLowerCase()));
    if (dropped.length === 0 && filledAdds.length === 0) local.push('Tick at least one member to remove, or add a new member.');
    dropped.forEach((m) => {
      if (reasonShort(dropReasons[m.email])) local.push(`Give a reason for removing ${m.isYou ? 'yourself' : m.name}.`);
    });
    filledAdds.forEach((a) => {
      if (!EMAIL_RE.test(a.email)) local.push(`${a.email} is not a valid email address.`);
      else if (rosterEmails.has(a.email)) local.push(`${a.email} is already on this team.`);
      if (!a.name.trim() || !a.institution.trim()) local.push(`Fill name and institution for ${a.email}.`);
      if (reasonShort(a.reason)) local.push(`Give a reason for adding ${a.name.trim() || a.email}.`);
    });
    if (!sizeOk) local.push(`The team must have ${TEAM_SIZE.min} to ${TEAM_SIZE.max} members after the change.`);
    if (!confirmed) local.push('Confirm that everyone affected knows about this request.');
    if (local.length) {
      setShowMissing(true);
      setErrors(local);
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }

    setBusy(true);
    setErrors([]);
    try {
      await postJson('/api/requests', 'POST', {
        kind: 'roster_change',
        confirmed,
        changes: {
          drop: dropped.map((m) => ({ email: m.email, name: m.name, reason: dropReasons[m.email] })),
          add: filledAdds.map(({ email, name, institution, reason }) => ({ email, name, institution, reason })),
          note: teamNote,
        },
      });
      onDone();
    } catch (err: any) {
      setErrors(err.errors?.length ? err.errors : [err.message]);
      setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setBusy(false);
    }
  }

  const summary = [
    dropped.length ? `Removing ${dropped.length}` : '',
    filledAdds.length ? `adding ${filledAdds.length}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      title="Request to edit the team"
      description="Tick anyone who should leave and add anyone who should join, with a reason for each. The organizers review the request; your team stays as it is until they approve it. Everyone on the team can see this request."
    >
      <form onSubmit={submit} noValidate aria-busy={busy} className="space-y-5">
        {note && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{note}</p>}

        <fieldset>
          <legend className={labelClass}>Current team: tick to remove</legend>
          <ul className="divide-y divide-slate-100 dark:divide-[#250D11] rounded-lg border border-slate-200 dark:border-[#3D1418]">
            {roster.map((m) => {
              const checked = m.email in dropReasons;
              const reasonId = `drop-reason-${m.email.replace(/[^a-z0-9]/gi, '')}`;
              const invalid = showMissing && checked && reasonShort(dropReasons[m.email]);
              return (
                <li key={m.email} className={clsx(checked && 'bg-rose-50/70 dark:bg-rose-950/20')}>
                  <label
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5',
                      m.isLead ? 'cursor-not-allowed' : 'cursor-pointer'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={m.isLead}
                      onChange={() => toggleDrop(m.email)}
                      aria-label={m.isLead ? `${m.name}, team lead, cannot be removed` : `Remove ${m.isYou ? 'yourself' : m.name}`}
                      className="accent-[#6C151E] h-4 w-4 disabled:opacity-40"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={clsx(
                          'block text-sm font-medium truncate',
                          checked ? 'text-rose-800 dark:text-rose-200 line-through' : 'text-slate-900 dark:text-[#FAF6F3]'
                        )}
                      >
                        {m.name}
                        {m.isYou && <span className="ml-1.5 text-xs font-normal text-slate-600 dark:text-slate-400 no-underline">(you)</span>}
                      </span>
                      <span className="block text-xs text-slate-600 dark:text-slate-400 truncate">{m.email}</span>
                    </span>
                    {m.isLead ? (
                      <StatusPill tone="info">Lead, cannot be removed</StatusPill>
                    ) : checked ? (
                      <StatusPill tone="danger">To remove</StatusPill>
                    ) : m.status === 'invited' ? (
                      <StatusPill tone="neutral">Invite pending</StatusPill>
                    ) : null}
                  </label>
                  {checked && (
                    <div className="px-3 pb-3 pl-10">
                      <label htmlFor={reasonId} className={labelClass}>
                        {m.isYou ? 'Why are you leaving?' : `Why should ${m.name} be removed?`}
                      </label>
                      <textarea
                        id={reasonId}
                        value={dropReasons[m.email]}
                        onChange={(e) => setDropReasons((prev) => ({ ...prev, [m.email]: e.target.value }))}
                        rows={2}
                        maxLength={500}
                        aria-invalid={invalid || undefined}
                        aria-describedby={`${reasonId}-hint`}
                        className={clsx(field, invalid && 'border-rose-500')}
                      />
                      <p id={`${reasonId}-hint`} className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        For example: exam on 28 Oct, cannot attend Phase 2. At least {MIN_MEMBER_REASON_LENGTH} characters.
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className={labelClass}>New members</legend>
          {adds.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">No one added yet.</p>}
          {adds.map((a, i) => {
            const label = a.name.trim() || `new member ${i + 1}`;
            const reasonInvalid = showMissing && Boolean(a.email.trim()) && reasonShort(a.reason);
            return (
              <div
                key={a.key}
                role="group"
                aria-label={`New member ${i + 1}`}
                className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/10 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">To add</p>
                  <button
                    type="button"
                    onClick={() => setAdds((prev) => prev.filter((x) => x.key !== a.key))}
                    aria-label={`Discard ${label}`}
                    className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-slate-600 hover:text-rose-700 dark:text-slate-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                    Discard
                  </button>
                </div>
                <div>
                  <label htmlFor={`add-email-${a.key}`} className={labelClass}>Gmail or email they sign in with</label>
                  <input
                    id={`add-email-${a.key}`}
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    value={a.email}
                    onChange={(e) => updateAdd(a.key, { email: e.target.value.trim().toLowerCase() })}
                    className={field}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`add-name-${a.key}`} className={labelClass}>Full name</label>
                    <input id={`add-name-${a.key}`} value={a.name} onChange={(e) => updateAdd(a.key, { name: e.target.value })} maxLength={70} className={field} />
                  </div>
                  <div>
                    <label htmlFor={`add-inst-${a.key}`} className={labelClass}>Institution</label>
                    <input id={`add-inst-${a.key}`} value={a.institution} onChange={(e) => updateAdd(a.key, { institution: e.target.value })} maxLength={120} className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor={`add-reason-${a.key}`} className={labelClass}>Why should {a.name.trim() || 'they'} join?</label>
                  <textarea
                    id={`add-reason-${a.key}`}
                    value={a.reason}
                    onChange={(e) => updateAdd(a.key, { reason: e.target.value })}
                    rows={2}
                    maxLength={500}
                    aria-invalid={reasonInvalid || undefined}
                    aria-describedby={`add-reason-${a.key}-hint`}
                    className={clsx(field, reasonInvalid && 'border-rose-500')}
                  />
                  <p id={`add-reason-${a.key}-hint`} className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    For example: worked with us on the Phase 1 notebook and replaces Rahul. At least {MIN_MEMBER_REASON_LENGTH} characters.
                  </p>
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addRow} disabled={finalSize >= TEAM_SIZE.max} className={buttonStyles.secondary}>
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            Add a member
          </button>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            New members must have signed in at the portal once with this email and must not be on another team.
          </p>
        </fieldset>

        <div
          className={clsx(
            'flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm',
            sizeOk ? 'bg-slate-50 dark:bg-[#1C0A0D] text-slate-700 dark:text-slate-200' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
          )}
          aria-live="polite"
        >
          <span className="flex items-center gap-2">
            <Users aria-hidden="true" className="h-4 w-4" />
            {summary ? `${summary.charAt(0).toUpperCase()}${summary.slice(1)}. ` : ''}Team after change: <strong>{finalSize} members</strong>
          </span>
          <span className="text-xs">Allowed: {TEAM_SIZE.min} to {TEAM_SIZE.max}</span>
        </div>

        <div>
          <label htmlFor="roster-note" className={labelClass}>Anything else the organizers should know (optional)</label>
          <textarea id="roster-note" value={teamNote} onChange={(e) => setTeamNote(e.target.value)} rows={2} maxLength={1000} className={field} />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="accent-[#6C151E] h-4 w-4 mt-0.5" />
          <span>Everyone being added has agreed to join, and everyone being removed, and the team lead, know about this request.</span>
        </label>

        {errors.length > 0 && (
          <ul
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-sm text-rose-800 dark:text-rose-200 space-y-1 focus:outline-none"
          >
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className={buttonStyles.primary}>
            {busy && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}
            {busy ? 'Sending…' : 'Send for review'}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className={buttonStyles.secondary}>Cancel</button>
        </div>
      </form>
    </Card>
  );
}

/* ───────────────────────────── History ───────────────────────────── */

function RequestItem({
  r,
  mine,
  canWithdraw,
  onWithdraw,
}: {
  r: ParticipantRequest;
  mine: boolean;
  canWithdraw: boolean;
  onWithdraw: (id: string) => void;
}) {
  const view = STATUS_VIEW[r.status];
  const add = r.changes?.add || [];
  const drop = r.changes?.drop || [];
  const title =
    r.kind === 'question'
      ? r.subject || QUESTION_CATEGORIES[r.category as QuestionCategory] || 'Question'
      : drop.length === 1 && add.length === 0 && drop[0].email === r.requester_email
        ? 'Request to leave the team'
        : 'Team edit request';
  // Requests sent before per-person reasons only have the overall message
  const perPerson = [...drop, ...add].some((c) => c.reason);

  return (
    <li className="rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mine ? 'You' : r.requester_name} · {formatIst(r.created_at)} IST
            {r.kind === 'question' && r.category && ` · ${QUESTION_CATEGORIES[r.category as QuestionCategory] || r.category}`}
          </p>
        </div>
        <StatusPill tone={view.tone}>{view.label}</StatusPill>
      </div>

      {r.kind === 'roster_change' && (drop.length > 0 || add.length > 0) && (
        <ul className="text-sm space-y-1">
          {drop.map((d) => (
            <li key={`d-${d.email}`} className="flex items-start gap-2">
              <UserMinus aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-rose-700 dark:text-rose-300" />
              <span>
                <span className="text-rose-800 dark:text-rose-200">Remove {d.name || d.email}</span>
                {d.reason && <span className="block text-slate-700 dark:text-slate-300">{d.reason}</span>}
              </span>
            </li>
          ))}
          {add.map((a) => (
            <li key={`a-${a.email}`} className="flex items-start gap-2">
              <UserPlus aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-300" />
              <span>
                <span className="text-emerald-800 dark:text-emerald-200">
                  Add {a.name} ({a.email})
                </span>
                {a.reason && <span className="block text-slate-700 dark:text-slate-300">{a.reason}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {r.kind === 'roster_change' && perPerson ? (
        r.changes?.note && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">Note: {r.changes.note}</p>
      ) : (
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{r.message}</p>
      )}

      {r.admin_response && (
        <div
          className={clsx(
            'rounded-md px-3 py-2.5 text-sm whitespace-pre-line',
            r.status === 'rejected'
              ? 'bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
              : 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
          )}
        >
          <p className="text-xs font-semibold mb-1">
            Organizing team{r.reviewed_at ? ` · ${formatIst(r.reviewed_at)} IST` : ''}
          </p>
          {r.admin_response}
        </div>
      )}
      {r.status === 'approved' && r.applied_at && !r.admin_response && (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">Approved and applied to your team on {formatIst(r.applied_at)} IST.</p>
      )}

      {canWithdraw && r.status === 'open' && (
        <button
          type="button"
          onClick={() => onWithdraw(r.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Withdraw
        </button>
      )}
    </li>
  );
}

/* ───────────────────────────── Section ───────────────────────────── */

export function RequestsSection({
  overview,
  initialForm,
  onRosterChanged,
}: {
  overview: ProfileOverview;
  initialForm: 'question' | 'roster' | null;
  onRosterChanged: () => void;
}) {
  const { data, error, mutate } = useParticipantRequests();
  const [form, setForm] = useState<'question' | 'roster' | null>(initialForm);
  const [flash, setFlash] = useState('');
  const me = overview.profile.email;

  const openRoster = useMemo(
    () => data?.requests.find((r) => r.kind === 'roster_change' && r.status === 'open') || null,
    [data]
  );

  if (!data) {
    return (
      <Card>
        {error ? (
          <p className="text-sm text-rose-600">{error.message}</p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading requests
          </p>
        )}
      </Card>
    );
  }

  if (!data.available) {
    return (
      <Card title="Requests">
        <EmptyState icon={MessageSquare} title="Requests open soon">
          Until then, write to qiskitfallfest@srmap.edu.in.
        </EmptyState>
      </Card>
    );
  }

  async function withdraw(id: string) {
    if (!window.confirm('Withdraw this request? The organizers will no longer review it.')) return;
    try {
      await postJson('/api/requests', 'PATCH', { id, action: 'withdraw' });
      mutate();
    } catch (err: any) {
      setFlash(err.message);
    }
  }

  function done(message: string) {
    setForm(null);
    setFlash(message);
    mutate();
    onRosterChanged();
  }

  const team = data.team;
  const canRoster = Boolean(team) && !data.rosterChangesClosed && !openRoster;

  return (
    <div className="space-y-4">
      {flash && (
        <p className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 text-sm text-emerald-900 dark:text-emerald-200" role="status">
          {flash}
        </p>
      )}

      {form === 'question' && (
        <QuestionForm onDone={() => done('Question sent. The reply will appear below.')} onCancel={() => setForm(null)} />
      )}
      {form === 'roster' && team && canRoster && (
        <TeamChangeForm
          overview={overview}
          note={data.rosterChangesNote}
          onDone={() => done('Change request sent for review. Your team stays as it is until it is approved.')}
          onCancel={() => setForm(null)}
        />
      )}

      {form === null && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setFlash('');
              setForm('question');
            }}
            className="group text-left rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 hover:border-burgundy/40 hover:shadow-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
          >
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                <MessageSquare className="h-4 w-4 text-burgundy dark:text-[#E89BA5]" />
                Ask a question
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-burgundy" />
            </span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              Payments, passes, schedule, accommodation or anything else.
            </span>
          </button>

          <button
            type="button"
            disabled={!canRoster}
            onClick={() => {
              setFlash('');
              setForm('roster');
            }}
            className="group text-left rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 enabled:hover:border-burgundy/40 enabled:hover:shadow-sm transition enabled:cursor-pointer disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
          >
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                <Users className="h-4 w-4 text-burgundy dark:text-[#E89BA5]" />
                Request to edit the team
              </span>
              {canRoster && <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-burgundy" />}
            </span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              {!team
                ? 'Only for hackathon team members.'
                : data.rosterChangesClosed
                  ? 'Team change requests are closed.'
                  : openRoster
                    ? 'Your team already has a request under review (see below).'
                    : 'Remove or add members, with a reason for each. Applied only after the organizers approve it.'}
            </span>
          </button>
        </div>
      )}

      <Card title="Your requests" description="Decisions and replies from the organizing team appear here.">
        {data.requests.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No requests yet" />
        ) : (
          <ul className="space-y-3">
            {data.requests.map((r) => (
              <RequestItem
                key={r.id}
                r={r}
                mine={r.requester_email === me}
                canWithdraw={r.requester_email === me || (r.kind === 'roster_change' && Boolean(team?.isLead))}
                onWithdraw={withdraw}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
