'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Loader2, X } from 'lucide-react';
import { enablePush, usePushState } from '@/lib/pwa';
import { getClientSession } from '@/lib/session-client';

const HIDDEN_UNTIL_KEY = 'qff_alert_strip_hidden_until';
const HIDE_FOR_MS = 3 * 24 * 60 * 60 * 1000;
const PROFILE_CARD_HREF = '/learning/profile#app-notifications';

function hiddenByUser(): boolean {
  try {
    return Number(localStorage.getItem(HIDDEN_UNTIL_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}

/**
 * Bottom strip on learning pages for signed-in participants who have not turned on
 * alerts on this device. "Not now" hides it on this device for 3 days. Not shown on
 * the profile (the checklist and card are there) or in the coding challenge editor.
 */
export function AppAlertStrip() {
  const pathname = usePathname();
  const [push] = usePushState();
  const [signedIn, setSignedIn] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHidden(hiddenByUser());
    let cancelled = false;
    getClientSession().then((s) => {
      if (!cancelled) setSignedIn(Boolean(s.authenticated && s.session));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const excludedPage = pathname?.startsWith('/learning/profile') || pathname?.startsWith('/learning/qiskit-challenge');
  if (!signedIn || hidden || excludedPage || (push !== 'off' && push !== 'needs-install')) return null;

  function dismiss() {
    try {
      localStorage.setItem(HIDDEN_UNTIL_KEY, String(Date.now() + HIDE_FOR_MS));
    } catch {}
    setHidden(true);
  }

  async function turnOn() {
    setBusy(true);
    setError(null);
    try {
      const next = await enablePush();
      if (next === 'denied') setError('Notifications are blocked in your browser settings.');
    } catch (err: any) {
      setError(err?.message || 'Could not turn on alerts.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="region"
      aria-label="On-campus alerts"
      className="fixed inset-x-4 bottom-4 z-40 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[24rem] rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-lg p-4"
    >
      <div className="flex items-start gap-3">
        <Bell aria-hidden="true" className="h-5 w-5 mt-0.5 shrink-0 text-burgundy dark:text-[#E89BA5]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Get on-campus alerts on this phone</p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {push === 'needs-install'
              ? 'On iPhone, add the portal to your Home Screen first, then turn on alerts from the app.'
              : 'Schedule changes, results and announcements during 26–30 October.'}
          </p>
          {error && (
            <p role="alert" className="mt-1.5 text-xs text-rose-700 dark:text-rose-300">
              {error}{' '}
              <Link href={PROFILE_CARD_HREF} className="font-semibold underline">
                Help
              </Link>
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {push === 'off' ? (
              <button
                type="button"
                onClick={turnOn}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-3 py-1.5 text-xs font-semibold text-white hover:bg-burgundy-deep disabled:opacity-60 cursor-pointer"
              >
                {busy && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}
                Turn on
              </button>
            ) : (
              <Link
                href={PROFILE_CARD_HREF}
                className="inline-flex items-center rounded-lg bg-burgundy px-3 py-1.5 text-xs font-semibold text-white hover:bg-burgundy-deep"
              >
                Show me how
              </Link>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#250D11] cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="-mt-1 -mr-1 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
