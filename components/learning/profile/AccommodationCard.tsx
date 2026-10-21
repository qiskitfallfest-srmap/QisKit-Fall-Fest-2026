'use client';

import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { AlertCircle, BedDouble, Loader2, RefreshCw } from 'lucide-react';
import {
  ACCOMMODATION_DATES,
  DEFAULT_CHECK_IN,
  DEFAULT_CHECK_OUT,
  GENDER_LABEL,
  formatStayDate,
  stayNights,
  type AccommodationPerson,
  type AccommodationStatus,
  type Gender,
} from '@/lib/accommodation';
import { OPEN_CONTACT_EVENT } from '@/lib/phone';
import { Card, StatusPill, buttonStyles, type Tone } from './profile-ui';

export const ACCOMMODATION_KEY = '/api/accommodation';
/** Window event the "Needs your attention" list fires to open the first unanswered row */
export const OPEN_ACCOMMODATION_EVENT = 'open-accommodation';

const CONTACT_EMAIL = 'qiskitfallfest@srmap.edu.in';
const FIRST_DATE = ACCOMMODATION_DATES[0];
const LAST_DATE = ACCOMMODATION_DATES[ACCOMMODATION_DATES.length - 1];

const fetcher = async (url: string): Promise<AccommodationStatus> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load accommodation details.');
  return json;
};

export function useAccommodation() {
  return useSWR<AccommodationStatus>(ACCOMMODATION_KEY, fetcher, { revalidateOnFocus: false });
}

function stayDetail(p: AccommodationPerson): string | undefined {
  const r = p.request;
  if (!r?.needs_accommodation || !r.check_in || !r.check_out) return undefined;
  const nights = stayNights(r.check_in, r.check_out).length;
  return `${GENDER_LABEL[r.gender as Gender] || ''} · ${formatStayDate(r.check_in)} to ${formatStayDate(r.check_out)} (${nights} night${nights === 1 ? '' : 's'})`;
}

function personState(p: AccommodationPerson): { tone: Tone; label: string } {
  const r = p.request;
  if (!r) return { tone: 'warning', label: 'Not answered' };
  if (!r.needs_accommodation) return { tone: 'neutral', label: 'No stay needed' };
  if (r.status === 'allocated') return { tone: 'success', label: 'Room allocated' };
  return { tone: 'info', label: 'Stay requested' };
}

const inputClass =
  'w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/40 aria-[invalid=true]:border-rose-500';

const optionClass = (selected: boolean) =>
  clsx(
    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer focus-within:ring-2 focus-within:ring-burgundy/40',
    selected
      ? 'border-burgundy bg-burgundy/5 text-burgundy dark:border-[#E89BA5] dark:text-[#E89BA5]'
      : 'border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-slate-700 dark:text-slate-200'
  );

type ErrorField = 'needs' | 'gender' | 'dates' | 'form';

function PersonForm({
  person,
  formId,
  onSaved,
  onCancel,
}: {
  person: AccommodationPerson;
  formId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const r = person.request;
  // No preselected answer: an unanswered row must be answered on purpose
  const [needs, setNeeds] = useState<boolean | null>(r ? r.needs_accommodation : null);
  const [gender, setGender] = useState<Gender | ''>((r?.gender as Gender) || '');
  const [checkIn, setCheckIn] = useState(r?.check_in || DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(r?.check_out || DEFAULT_CHECK_OUT);
  const [phone, setPhone] = useState(r?.phone || '');
  const [notes, setNotes] = useState(r?.notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: ErrorField; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const idBase = formId;
  const errorId = `${idBase}-error`;
  const nightsId = `${idBase}-nights`;
  const datesHintId = `${idBase}-dates-hint`;
  const notesHintId = `${idBase}-notes-hint`;

  const focusGroup = (name: string) => {
    const form = formRef.current;
    if (!form) return;
    const target =
      form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`) ||
      form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    target?.focus();
  };

  // Move focus into the form when it opens so keyboard and screen-reader users land on the first question
  useEffect(() => {
    focusGroup(`${idBase}-needs`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fail(field: ErrorField, message: string) {
    setError({ field, message });
    if (field === 'needs') focusGroup(`${idBase}-needs`);
    else if (field === 'gender') focusGroup(`${idBase}-gender`);
    else if (field === 'dates') document.getElementById(`${idBase}-out`)?.focus();
  }

  function changeCheckIn(value: string) {
    setCheckIn(value);
    // Keep the stay valid: push check-out to the next day when it would fall on or before check-in
    if (checkOut <= value) {
      const next = ACCOMMODATION_DATES[ACCOMMODATION_DATES.indexOf(value) + 1];
      if (next) setCheckOut(next);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (needs === null) return fail('needs', 'Choose whether a place to stay is needed.');
    if (needs && !gender) return fail('gender', 'Select a gender so rooms can be allocated.');
    if (needs && checkOut <= checkIn) return fail('dates', 'Check-out must be after check-in.');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/accommodation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: person.email,
          needsAccommodation: needs,
          gender: gender || undefined,
          checkIn,
          checkOut,
          notes,
          ...(person.isYou ? { phone } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not save.');
      onSaved();
    } catch (err: any) {
      setError({ field: 'form', message: err?.message || 'Could not save.' });
    } finally {
      setBusy(false);
    }
  }

  const nights = needs ? stayNights(checkIn, checkOut).length : 0;
  const describedBy = (field: ErrorField, ...ids: string[]) =>
    [...ids, error?.field === field ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <form
      id={idBase}
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={busy}
      aria-label={person.isYou ? 'Your accommodation' : `Accommodation for ${person.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !busy) onCancel();
      }}
      className="mt-3 space-y-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-3.5"
    >
      <fieldset aria-describedby={describedBy('needs')}>
        <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
          {person.isYou ? 'Do you need a place to stay?' : `Does ${person.name} need a place to stay?`}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { v: true, label: 'Yes, needs a stay' },
            { v: false, label: 'No, has own arrangement' },
          ].map((o) => (
            <label key={String(o.v)} className={optionClass(needs === o.v)}>
              <input
                type="radio"
                name={`${idBase}-needs`}
                checked={needs === o.v}
                onChange={() => {
                  setNeeds(o.v);
                  if (error?.field === 'needs') setError(null);
                }}
                className="accent-[#6C151E]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {needs && (
        <>
          <fieldset aria-describedby={describedBy('gender')}>
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Gender (for room allocation)</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
                <label key={g} className={optionClass(gender === g)}>
                  <input
                    type="radio"
                    name={`${idBase}-gender`}
                    checked={gender === g}
                    onChange={() => {
                      setGender(g);
                      if (error?.field === 'gender') setError(null);
                    }}
                    className="accent-[#6C151E]"
                  />
                  {GENDER_LABEL[g]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <p id={datesHintId} className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              Rooms are available from the night of {formatStayDate(FIRST_DATE)}, the evening before Day 1. Check out by{' '}
              {formatStayDate(LAST_DATE)}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${idBase}-in`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Check-in
                </label>
                <select
                  id={`${idBase}-in`}
                  value={checkIn}
                  onChange={(e) => changeCheckIn(e.target.value)}
                  aria-describedby={datesHintId}
                  className={inputClass}
                >
                  {ACCOMMODATION_DATES.slice(0, -1).map((d) => (
                    <option key={d} value={d}>
                      {formatStayDate(d)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${idBase}-out`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Check-out
                </label>
                <select
                  id={`${idBase}-out`}
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    if (error?.field === 'dates') setError(null);
                  }}
                  aria-invalid={error?.field === 'dates' || undefined}
                  aria-describedby={describedBy('dates', nightsId)}
                  className={inputClass}
                >
                  {ACCOMMODATION_DATES.slice(1).map((d) => (
                    <option key={d} value={d} disabled={d <= checkIn}>
                      {formatStayDate(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p id={nightsId} aria-live="polite" className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Choose a check-out after check-in.'}
            </p>
          </div>
        </>
      )}

      {person.isYou && (
        <div>
          <label htmlFor={`${idBase}-phone`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Phone for the accommodation desk (optional)
          </label>
          <input
            id={`${idBase}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor={`${idBase}-notes`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Notes (optional)
        </label>
        <p id={notesHintId} className="text-xs text-slate-600 dark:text-slate-400 mb-1">
          Arrival time, accessibility needs or roommate preference.
        </p>
        <textarea
          id={`${idBase}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
          aria-describedby={notesHintId}
          className={inputClass}
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0" />
          {error.message}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={buttonStyles.primary}>
          {busy && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} className={buttonStyles.secondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * Accommodation for external participants. Renders nothing for SRM AP participants.
 * A team lead sees one row per external member and can answer for each of them.
 * `mayBeExternal` comes from data the page already has; a load failure is only shown when it is true.
 */
export function AccommodationCard({ mayBeExternal }: { mayBeExternal: boolean }) {
  const { data, error, isLoading, mutate } = useAccommodation();
  const [editing, setEditing] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null);
  const rowButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const rowItems = useRef<Record<string, HTMLLIElement | null>>({});

  // After closing a form, put focus back on that row's Answer/Edit button (or the row if it is now locked)
  useEffect(() => {
    if (!returnFocusTo || editing) return;
    (rowButtons.current[returnFocusTo] || rowItems.current[returnFocusTo])?.focus();
    setReturnFocusTo(null);
  }, [returnFocusTo, editing, data]);

  // "Needs your attention" opens the first unanswered row
  useEffect(() => {
    function open() {
      const first = data?.people.find((p) => !p.request);
      document.getElementById('accommodation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (first && !data?.closed && data?.contactConfirmed) setEditing(first.email);
    }
    window.addEventListener(OPEN_ACCOMMODATION_EVENT, open);
    return () => window.removeEventListener(OPEN_ACCOMMODATION_EVENT, open);
  }, [data]);

  if (!data) {
    if (isLoading || !error || !mayBeExternal) return null;
    return (
      <Card id="accommodation" title="Accommodation">
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <AlertCircle aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            Could not load accommodation details. External participants need to answer this before the event.
          </p>
          <button type="button" onClick={() => mutate()} className={buttonStyles.secondary}>
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      </Card>
    );
  }
  if (!data.eligible) return null;

  const unanswered = data.people.filter((p) => !p.request).length;
  const multiple = data.people.length > 1;

  function close(email: string, message?: string) {
    setEditing(null);
    setReturnFocusTo(email);
    if (message) setAnnouncement(message);
  }

  return (
    <Card
      id="accommodation"
      title="Accommodation"
      description={
        <>
          For external participants during the on-campus days, 26–30 October. Rooms are available from the night of{' '}
          {formatStayDate(FIRST_DATE)} until check-out on {formatStayDate(LAST_DATE)}.{' '}
          {multiple
            ? 'As team lead you can answer for each external teammate; they can also update their own.'
            : 'Tell us if you need a place to stay so we can book rooms.'}
        </>
      }
      action={
        data.closed ? (
          <StatusPill tone="neutral">Closed</StatusPill>
        ) : unanswered > 0 ? (
          <StatusPill tone="warning">{unanswered} not answered</StatusPill>
        ) : (
          <StatusPill tone="success">All answered</StatusPill>
        )
      }
    >
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {!data.contactConfirmed && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2">
          <p className="text-sm text-amber-900 dark:text-amber-200">Confirm your mobile number and emergency contact to answer this.</p>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT))} className={buttonStyles.secondary}>
            Confirm now
          </button>
        </div>
      )}
      {data.note && <p className="mb-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{data.note}</p>}
      <ul className="divide-y divide-slate-100 dark:divide-[#250D11] -my-2">
        {data.people.map((p) => {
          const s = personState(p);
          const detail = stayDetail(p);
          const allocated = p.request?.status === 'allocated';
          const isEditing = editing === p.email;
          const locked = data.closed || allocated;
          const formId = `acc-${p.email.replace(/[^a-z0-9]/gi, '')}`;
          const who = p.isYou ? 'yourself' : p.name;
          return (
            <li
              key={p.email}
              ref={(el) => {
                rowItems.current[p.email] = el;
              }}
              tabIndex={-1}
              className="py-3 focus:outline-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex items-start gap-2.5">
                  <BedDouble aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-[#FAF6F3] truncate">
                      {p.name}
                      {p.isYou && <span className="ml-1.5 text-xs font-normal text-slate-600 dark:text-slate-400">(you)</span>}
                    </p>
                    {allocated && p.request?.allocation_notes && (
                      <p className="text-xs text-slate-700 dark:text-slate-300">{p.request.allocation_notes}</p>
                    )}
                    {detail && <p className="text-xs text-slate-600 dark:text-slate-400">{detail}</p>}
                    {allocated && !data.closed && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        The room is booked, so this can no longer be edited here. Write to {CONTACT_EMAIL} to change it.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 sm:pl-0">
                  <StatusPill tone={s.tone}>{s.label}</StatusPill>
                  {!locked && data.contactConfirmed && !isEditing && (
                    <button
                      type="button"
                      ref={(el) => {
                        rowButtons.current[p.email] = el;
                      }}
                      onClick={() => setEditing(p.email)}
                      aria-label={`${p.request ? 'Edit' : 'Answer'} accommodation for ${who}`}
                      className="inline-flex min-h-8 items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:bg-burgundy/5 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                    >
                      {p.request ? 'Edit' : 'Answer'}
                    </button>
                  )}
                </div>
              </div>
              {isEditing && (
                <PersonForm
                  person={p}
                  formId={formId}
                  onCancel={() => close(p.email)}
                  onSaved={() => {
                    close(p.email, `Saved accommodation for ${who}.`);
                    mutate();
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        The organizing team confirms each booking, including any cost, before the event.
        {data.closed && ` Requests are closed; write to ${CONTACT_EMAIL} for changes.`}
      </p>
    </Card>
  );
}
