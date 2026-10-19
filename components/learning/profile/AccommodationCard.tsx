'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { BedDouble, Loader2 } from 'lucide-react';
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
import { Card, StatusPill, buttonStyles, type Tone } from './profile-ui';

export const ACCOMMODATION_KEY = '/api/accommodation';

const fetcher = async (url: string): Promise<AccommodationStatus> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load accommodation details.');
  return json;
};

function personState(p: AccommodationPerson): { tone: Tone; label: string; detail?: string } {
  const r = p.request;
  if (!r) return { tone: 'warning', label: 'Not answered' };
  if (!r.needs_accommodation) return { tone: 'neutral', label: 'No stay needed' };
  const nights = stayNights(r.check_in, r.check_out).length;
  const detail = `${GENDER_LABEL[r.gender as Gender] || ''} · ${formatStayDate(r.check_in!)} to ${formatStayDate(r.check_out!)} (${nights} night${nights === 1 ? '' : 's'})`;
  if (r.status === 'allocated') return { tone: 'success', label: 'Room allocated', detail: r.allocation_notes || detail };
  return { tone: 'info', label: 'Stay requested', detail };
}

const inputClass =
  'w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/40';

function PersonForm({ person, onSaved, onCancel }: { person: AccommodationPerson; onSaved: () => void; onCancel: () => void }) {
  const r = person.request;
  const [needs, setNeeds] = useState<boolean>(r ? r.needs_accommodation : true);
  const [gender, setGender] = useState<Gender | ''>((r?.gender as Gender) || '');
  const [checkIn, setCheckIn] = useState(r?.check_in || DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(r?.check_out || DEFAULT_CHECK_OUT);
  const [phone, setPhone] = useState(r?.phone || '');
  const [notes, setNotes] = useState(r?.notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const idBase = `acc-${person.email.replace(/[^a-z0-9]/gi, '')}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (needs && !gender) {
      setError('Select a gender so rooms can be allocated.');
      return;
    }
    if (needs && checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setBusy(true);
    setError('');
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
      setError(err?.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  const nights = needs ? stayNights(checkIn, checkOut).length : 0;

  return (
    <form onSubmit={submit} className="mt-3 space-y-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-3.5">
      <fieldset>
        <legend className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
          {person.isYou ? 'Do you need a place to stay?' : `Does ${person.name} need a place to stay?`}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: true, label: 'Yes, needs a stay' },
            { v: false, label: 'No, has own arrangement' },
          ].map((o) => (
            <label
              key={String(o.v)}
              className={clsx(
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer',
                needs === o.v
                  ? 'border-burgundy bg-burgundy/5 text-burgundy dark:border-[#E89BA5] dark:text-[#E89BA5]'
                  : 'border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-slate-700 dark:text-slate-200'
              )}
            >
              <input type="radio" name={`${idBase}-needs`} checked={needs === o.v} onChange={() => setNeeds(o.v)} className="accent-[#6C151E]" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {needs && (
        <>
          <fieldset>
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Gender (for room allocation)</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
                <label
                  key={g}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer',
                    gender === g
                      ? 'border-burgundy bg-burgundy/5 text-burgundy dark:border-[#E89BA5] dark:text-[#E89BA5]'
                      : 'border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-slate-700 dark:text-slate-200'
                  )}
                >
                  <input type="radio" name={`${idBase}-gender`} checked={gender === g} onChange={() => setGender(g)} className="accent-[#6C151E]" />
                  {GENDER_LABEL[g]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${idBase}-in`} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Check-in
              </label>
              <select id={`${idBase}-in`} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass}>
                {ACCOMMODATION_DATES.slice(0, -1).map((d) => (
                  <option key={d} value={d}>
                    {formatStayDate(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${idBase}-out`} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Check-out
              </label>
              <select id={`${idBase}-out`} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass}>
                {ACCOMMODATION_DATES.slice(1).map((d) => (
                  <option key={d} value={d} disabled={d <= checkIn}>
                    {formatStayDate(d)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Choose a check-out after check-in.'}
          </p>
        </>
      )}

      {person.isYou && (
        <div>
          <label htmlFor={`${idBase}-phone`} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
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
        <label htmlFor={`${idBase}-notes`} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Notes (optional)
        </label>
        <textarea
          id={`${idBase}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Arrival time, accessibility needs, roommate preference"
          className={inputClass}
        />
      </div>

      {error && <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={buttonStyles.primary}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
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
 */
export function AccommodationCard() {
  const { data, mutate } = useSWR<AccommodationStatus>(ACCOMMODATION_KEY, fetcher, { revalidateOnFocus: false });
  const [editing, setEditing] = useState<string | null>(null);

  if (!data?.eligible) return null;

  const unanswered = data.people.filter((p) => !p.request).length;
  const multiple = data.people.length > 1;

  return (
    <Card
      id="accommodation"
      title="Accommodation, 26–30 October"
      description={
        multiple
          ? 'For external participants. As team lead you can answer for each external teammate; they can also update their own.'
          : 'For external participants. Tell us if you need a place to stay so we can book rooms.'
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
      {data.note && <p className="mb-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{data.note}</p>}
      <ul className="divide-y divide-slate-100 dark:divide-[#250D11] -my-2">
        {data.people.map((p) => {
          const s = personState(p);
          const isEditing = editing === p.email;
          const locked = data.closed || p.request?.status === 'allocated';
          return (
            <li key={p.email} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex items-start gap-2.5">
                  <BedDouble className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-[#FAF6F3] truncate">
                      {p.name}
                      {p.isYou && <span className="ml-1.5 text-xs font-normal text-slate-500">(you)</span>}
                    </p>
                    {s.detail && <p className="text-xs text-slate-500 dark:text-slate-400">{s.detail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 sm:pl-0">
                  <StatusPill tone={s.tone}>{s.label}</StatusPill>
                  {!locked && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setEditing(p.email)}
                      className="text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline cursor-pointer"
                    >
                      {p.request ? 'Edit' : 'Answer'}
                    </button>
                  )}
                </div>
              </div>
              {isEditing && (
                <PersonForm
                  person={p}
                  onCancel={() => setEditing(null)}
                  onSaved={() => {
                    setEditing(null);
                    mutate();
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The organizing team confirms each booking, including any cost, before the event.
        {data.closed && ' Requests are closed; write to qiskitfallfest@srmap.edu.in for changes.'}
      </p>
    </Card>
  );
}
