'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { AlertTriangle, Loader2, Lock } from 'lucide-react';
import { CERTIFICATE_NAME_MAX, normalizeCertificateName, validateCertificateName } from '@/lib/certificate-name-shared';
import { Card, StatusPill, buttonStyles, formatIst } from './profile-ui';

export const CERTIFICATE_NAME_KEY = '/api/user/certificate-name';

export interface CertificateNameStatus {
  success: boolean;
  name: string | null;
  confirmedAt: string | null;
  locked: boolean;
  suggested: string;
}

const fetcher = async (url: string): Promise<CertificateNameStatus> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load your certificate name.');
  return json;
};

export function useCertificateName() {
  return useSWR<CertificateNameStatus>(CERTIFICATE_NAME_KEY, fetcher, { revalidateOnFocus: false });
}

/**
 * The exact name printed on certificates. Everyone can set it; participants who are
 * eligible for a certificate get the spelling warning because their name prints soon.
 */
export function CertificateNameCard({ eligible, id }: { eligible: boolean; id?: string }) {
  const { data, mutate } = useCertificateName();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!data) return null;

  const current = data.name;
  const preview = normalizeCertificateName(value);
  const problem = value ? validateCertificateName(value) : null;

  function startEdit() {
    setValue(current || data!.suggested || '');
    setConfirmed(false);
    setError('');
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const issue = validateCertificateName(value);
    if (issue) return setError(issue);
    if (!confirmed) return setError('Tick the box to confirm the spelling.');
    setBusy(true);
    setError('');
    try {
      const res = await fetch(CERTIFICATE_NAME_KEY, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value, confirmed: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not save.');
      await mutate({ ...data!, name: json.name, confirmedAt: json.confirmedAt }, { revalidate: false });
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const needsConfirm = !data.locked && !data.confirmedAt;

  return (
    <Card
      id={id}
      title="Name on certificate"
      description="Printed exactly as entered on your certificates."
      action={
        data.locked ? (
          <StatusPill tone="neutral">
            <Lock className="h-3 w-3" />
            Issued
          </StatusPill>
        ) : data.confirmedAt ? (
          <StatusPill tone="success">Confirmed</StatusPill>
        ) : eligible ? (
          <StatusPill tone="warning">Not confirmed</StatusPill>
        ) : undefined
      }
      className={clsx(eligible && needsConfirm && 'border-amber-300 dark:border-amber-800')}
    >
      {eligible && !data.locked && (
        <div className="mb-4 flex gap-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            You are eligible for a certificate. Check the spelling, capitalization and order of your name carefully.
            Once the certificate is issued, the name cannot be changed.
          </p>
        </div>
      )}

      {!editing ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={clsx('font-serif text-lg sm:text-xl break-words', current ? 'text-slate-900 dark:text-[#FAF6F3]' : 'text-slate-400')}>
              {current || data.suggested || 'Not set'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.locked
                ? 'Your certificate was issued with this name. For a correction, write to qiskitfallfest@srmap.edu.in.'
                : data.confirmedAt
                  ? `Confirmed on ${formatIst(data.confirmedAt)} IST`
                  : 'Taken from your account name until you confirm it.'}
            </p>
          </div>
          {!data.locked && (
            <button type="button" onClick={startEdit} className={needsConfirm && eligible ? buttonStyles.primary : buttonStyles.secondary}>
              {data.confirmedAt ? 'Change' : 'Review and confirm'}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <div>
            <label htmlFor="certificate-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Full name as it should appear
            </label>
            <input
              id="certificate-name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={CERTIFICATE_NAME_MAX}
              autoComplete="name"
              autoFocus
              className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/40"
            />
            {problem && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{problem}</p>}
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 dark:border-[#3D1418] px-3 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Preview</p>
            <p className="font-serif text-xl text-slate-900 dark:text-[#FAF6F3] break-words min-h-[1.75rem]">{preview}</p>
          </div>

          <label className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="accent-[#6C151E] h-4 w-4 mt-0.5" />
            <span>I have checked the spelling. This exact name will be printed.</span>
          </label>

          {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={busy || Boolean(problem)} className={buttonStyles.primary}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save name
            </button>
            <button type="button" disabled={busy} onClick={() => setEditing(false)} className={buttonStyles.secondary}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
