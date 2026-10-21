'use client';

import React, { useState } from 'react';
import { AlertCircle, Bell, BellOff, Download, Loader2, Share, Smartphone } from 'lucide-react';
import {
  disablePush,
  enablePush,
  promptInstall,
  useInstallState,
  usePushState,
  type InstallState,
  type PushState,
} from '@/lib/pwa';
import { Card, StatusPill, buttonStyles } from './profile-ui';

function InstallRow({ state }: { state: InstallState }) {
  const [busy, setBusy] = useState(false);

  let detail: React.ReactNode;
  let control: React.ReactNode = null;
  switch (state) {
    case 'installed':
      detail = 'You are using the installed app.';
      control = <StatusPill tone="success">Installed</StatusPill>;
      break;
    case 'prompt':
      detail = 'Open the portal from your home screen, like any other app.';
      control = (
        <button
          type="button"
          disabled={busy}
          className={buttonStyles.primary}
          onClick={async () => {
            setBusy(true);
            await promptInstall().catch(() => false);
            setBusy(false);
          }}
        >
          {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Download aria-hidden="true" className="h-4 w-4" />}
          Install app
        </button>
      );
      break;
    case 'ios':
      detail = (
        <>
          In Safari, tap <Share aria-label="Share" className="inline h-3.5 w-3.5 -mt-0.5" /> <strong>Share</strong>, then{' '}
          <strong>Add to Home Screen</strong>. Open the app from your Home Screen afterwards.
        </>
      );
      break;
    case 'manual':
      detail = (
        <>
          Open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>. If you
          opened this link inside WhatsApp or Instagram, open it in Chrome first.
        </>
      );
      break;
    default:
      detail = null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <Smartphone aria-hidden="true" className="h-5 w-5 mt-0.5 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Install the app</p>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{detail}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

const PUSH_DETAIL: Record<PushState, string> = {
  loading: '',
  on: 'You will get alerts on this device for schedule changes, results and on-campus announcements.',
  off: 'Get alerts on this device for schedule changes, results and on-campus announcements.',
  denied:
    'Notifications are blocked for this site. Allow them in your browser’s site settings for qffsrmap2026.com, then reload this page.',
  'needs-install':
    'On iPhone and iPad, notifications work only from the Home Screen app. Install it first, open it, and turn notifications on here.',
  unsupported: 'This browser does not support notifications. Try Chrome, Edge, Firefox or Safari.',
};

function PushRow({ state, setState }: { state: PushState; setState: (s: PushState) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<PushState>) {
    setBusy(true);
    setError(null);
    try {
      setState(await action());
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  let control: React.ReactNode = null;
  if (state === 'on') {
    control = (
      <button type="button" disabled={busy} className={buttonStyles.secondary} onClick={() => run(disablePush)}>
        {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <BellOff aria-hidden="true" className="h-4 w-4" />}
        Turn off
      </button>
    );
  } else if (state === 'off') {
    control = (
      <button type="button" disabled={busy} className={buttonStyles.primary} onClick={() => run(enablePush)}>
        {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Bell aria-hidden="true" className="h-4 w-4" />}
        Turn on
      </button>
    );
  } else if (state === 'denied') {
    control = <StatusPill tone="danger">Blocked</StatusPill>;
  }

  return (
    <div className="py-3 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Bell aria-hidden="true" className="h-5 w-5 mt-0.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
              Notifications
              {state === 'on' && <StatusPill tone="success">On</StatusPill>}
            </p>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{PUSH_DETAIL[state]}</p>
          </div>
        </div>
        {control}
      </div>
      {error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Install the portal as an app and turn on push notifications for this device.
 * On the overview it shows only while notifications are off; in the Account tab
 * (`alwaysShow`) it always shows.
 */
export function AppNotificationsCard({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const install = useInstallState();
  const [push, setPush] = usePushState();

  if (install === 'unknown' || push === 'loading') return null;
  if (!alwaysShow && (push === 'on' || push === 'unsupported')) return null;

  return (
    <Card
      id="app-notifications"
      title="App and notifications"
      description="Install the portal on your phone and get on-campus updates during 26–30 October. Notifications are per device."
    >
      <div className="divide-y divide-slate-100 dark:divide-[#2A0E12]">
        <InstallRow state={install} />
        <PushRow state={push} setState={setPush} />
      </div>
    </Card>
  );
}
