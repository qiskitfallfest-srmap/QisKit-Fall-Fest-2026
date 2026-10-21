'use client';

import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { AlertCircle, Bus, Loader2, RefreshCw } from 'lucide-react';
import {
  OTHER_BOARDING_POINT,
  TRAVEL_DATES,
  boardingLabel,
  formatTravelDate,
  type TransportPerson,
  type TransportStatus,
} from '@/lib/transport';
import { OPEN_CONTACT_EVENT } from '@/lib/phone';
import { Card, StatusPill, buttonStyles, type Tone } from './profile-ui';

export const TRANSPORT_KEY = '/api/transport';
/** Window event the "Needs your attention" list fires to open the first unanswered row */
export const OPEN_TRANSPORT_EVENT = 'open-transport';

const CONTACT_EMAIL = 'qiskitfallfest@srmap.edu.in';

const fetcher = async (url: string): Promise<TransportStatus> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load bus travel details.');
  return json;
};

export function useTransport() {
  return useSWR<TransportStatus>(TRANSPORT_KEY, fetcher, { revalidateOnFocus: false });
}

function travelDetail(p: TransportPerson): string | undefined {
  const r = p.request;
  if (!r?.needs_transport) return undefined;
  const days = r.travel_dates.length === TRAVEL_DATES.length ? 'all 5 days' : r.travel_dates.map((d) => `Day ${TRAVEL_DATES.indexOf(d) + 1}`).join(', ');
  return `From ${boardingLabel(r)} · ${days}`;
}

function personState(p: TransportPerson): { tone: Tone; label: string } {
  if (!p.request) return { tone: 'warning', label: 'Not answered' };
  if (!p.request.needs_transport) return { tone: 'neutral', label: 'Own arrangement' };
  return { tone: 'info', label: 'Bus requested' };
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

type ErrorField = 'needs' | 'point' | 'other' | 'dates' | 'form';

function PersonForm({
  person,
  boardingPoints,
  formId,
  onSaved,
  onCancel,
}: {
  person: TransportPerson;
  boardingPoints: string[];
  formId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const r = person.request;
  // No preselected answer: an unanswered row must be answered on purpose
  const [needs, setNeeds] = useState<boolean | null>(r ? r.needs_transport : null);
  const [point, setPoint] = useState(r?.boarding_point || '');
  const [other, setOther] = useState(r?.boarding_other || '');
  const [dates, setDates] = useState<string[]>(r?.travel_dates?.length ? r.travel_dates : TRAVEL_DATES);
  const [phone, setPhone] = useState(r?.phone || '');
  const [notes, setNotes] = useState(r?.notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: ErrorField; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const idBase = formId;
  const errorId = `${idBase}-error`;
  // A stored point the organizers later removed from the list still shows as selected
  const points = point && point !== OTHER_BOARDING_POINT && !boardingPoints.includes(point) ? [...boardingPoints, point] : boardingPoints;

  const focusGroup = (name: string) => {
    const form = formRef.current;
    if (!form) return;
    const target =
      form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`) ||
      form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    target?.focus();
  };

  useEffect(() => {
    focusGroup(`${idBase}-needs`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fail(field: ErrorField, message: string) {
    setError({ field, message });
    if (field === 'needs') focusGroup(`${idBase}-needs`);
    else if (field === 'point') focusGroup(`${idBase}-point`);
    else if (field === 'other') document.getElementById(`${idBase}-other`)?.focus();
    else if (field === 'dates') focusGroup(`${idBase}-dates`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (needs === null) return fail('needs', 'Choose whether the SRM bus is needed.');
    if (needs && !point) return fail('point', 'Choose a boarding point.');
    if (needs && point === OTHER_BOARDING_POINT && other.trim().length < 2) return fail('other', 'Type the place you will board from.');
    if (needs && dates.length === 0) return fail('dates', 'Select at least one day.');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(TRANSPORT_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: person.email,
          needsTransport: needs,
          boardingPoint: point,
          boardingOther: other,
          travelDates: dates,
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

  const describedBy = (field: ErrorField) => (error?.field === field ? errorId : undefined);

  return (
    <form
      id={idBase}
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={busy}
      aria-label={person.isYou ? 'Your bus travel' : `Bus travel for ${person.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !busy) onCancel();
      }}
      className="mt-3 space-y-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-3.5"
    >
      <fieldset aria-describedby={describedBy('needs')}>
        <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
          {person.isYou ? 'Do you need the SRM bus to reach campus?' : `Does ${person.name} need the SRM bus to reach campus?`}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { v: true, label: 'Yes, needs the bus' },
            { v: false, label: 'No, own arrangement or staying on campus' },
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
          <fieldset aria-describedby={describedBy('point')}>
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Boarding point</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...points, OTHER_BOARDING_POINT].map((pt) => (
                <label key={pt} className={optionClass(point === pt)}>
                  <input
                    type="radio"
                    name={`${idBase}-point`}
                    checked={point === pt}
                    onChange={() => {
                      setPoint(pt);
                      if (error?.field === 'point') setError(null);
                    }}
                    className="accent-[#6C151E]"
                  />
                  {pt}
                </label>
              ))}
            </div>
            {point === OTHER_BOARDING_POINT && (
              <div className="mt-2">
                <label htmlFor={`${idBase}-other`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Place you will board from
                </label>
                <input
                  id={`${idBase}-other`}
                  value={other}
                  onChange={(e) => {
                    setOther(e.target.value);
                    if (error?.field === 'other') setError(null);
                  }}
                  maxLength={80}
                  placeholder="Town or landmark"
                  aria-invalid={error?.field === 'other' || undefined}
                  aria-describedby={describedBy('other')}
                  className={inputClass}
                />
              </div>
            )}
          </fieldset>

          <fieldset aria-describedby={describedBy('dates')}>
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Days you need the bus</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRAVEL_DATES.map((d) => {
                const checked = dates.includes(d);
                return (
                  <label key={d} className={optionClass(checked)}>
                    <input
                      type="checkbox"
                      name={`${idBase}-dates`}
                      checked={checked}
                      onChange={() => {
                        setDates((prev) => (checked ? prev.filter((x) => x !== d) : TRAVEL_DATES.filter((x) => x === d || prev.includes(x))));
                        if (error?.field === 'dates') setError(null);
                      }}
                      className="accent-[#6C151E]"
                    />
                    {formatTravelDate(d)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </>
      )}

      {person.isYou && (
        <div>
          <label htmlFor={`${idBase}-phone`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
            WhatsApp number for bus updates (optional)
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
        <label htmlFor={`${idBase}-notes`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
          Notes (optional)
        </label>
        <textarea
          id={`${idBase}-notes`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
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
 * SRM bus travel for Phase 2 shortlisted teams and external General Pass holders. Renders nothing for anyone else.
 * A team lead sees one row per teammate and can answer for each of them.
 * `mayBeShortlisted` comes from data the page already has; a load failure is only shown when it is true.
 */
export function TransportCard({ mayBeShortlisted }: { mayBeShortlisted: boolean }) {
  const { data, error, isLoading, mutate } = useTransport();
  const [editing, setEditing] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null);
  const rowButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const rowItems = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    if (!returnFocusTo || editing) return;
    (rowButtons.current[returnFocusTo] || rowItems.current[returnFocusTo])?.focus();
    setReturnFocusTo(null);
  }, [returnFocusTo, editing, data]);

  // "Needs your attention" opens the first unanswered row
  useEffect(() => {
    function open() {
      const first = data?.people.find((p) => !p.request);
      document.getElementById('transport')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (first && !data?.closed && data?.contactConfirmed) setEditing(first.email);
    }
    window.addEventListener(OPEN_TRANSPORT_EVENT, open);
    return () => window.removeEventListener(OPEN_TRANSPORT_EVENT, open);
  }, [data]);

  if (!data) {
    if (isLoading || !error || !mayBeShortlisted) return null;
    return (
      <Card id="transport" title="SRM bus travel">
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <AlertCircle aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            Could not load bus travel details.
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
      id="transport"
      title="SRM bus travel"
      description={
        <>
          SRM buses will bring participants to campus on the event days, 26–30 October. Tell us where you will board so we can
          plan routes and seats.{' '}
          {multiple ? 'As team lead you can answer for each teammate; they can also update their own.' : ''}
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
          const detail = travelDetail(p);
          const isEditing = editing === p.email;
          const formId = `bus-${p.email.replace(/[^a-z0-9]/gi, '')}`;
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
                  <Bus aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-[#FAF6F3] truncate">
                      {p.name}
                      {p.isYou && <span className="ml-1.5 text-xs font-normal text-slate-600 dark:text-slate-400">(you)</span>}
                    </p>
                    {detail && <p className="text-xs text-slate-600 dark:text-slate-400">{detail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 sm:pl-0">
                  <StatusPill tone={s.tone}>{s.label}</StatusPill>
                  {!data.closed && data.contactConfirmed && !isEditing && (
                    <button
                      type="button"
                      ref={(el) => {
                        rowButtons.current[p.email] = el;
                      }}
                      onClick={() => setEditing(p.email)}
                      aria-label={`${p.request ? 'Edit' : 'Answer'} bus travel for ${who}`}
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
                  boardingPoints={data.boardingPoints}
                  formId={formId}
                  onCancel={() => close(p.email)}
                  onSaved={() => {
                    close(p.email, `Saved bus travel for ${who}.`);
                    mutate();
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        Pickup times and exact stops will be shared before Day 1.
        {data.closed && ` Responses are closed; write to ${CONTACT_EMAIL} for changes.`}
      </p>
    </Card>
  );
}
