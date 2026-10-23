'use client';

import { useSyncExternalStore } from 'react';

/**
 * Client helpers for the installable app and Web Push.
 *
 * `beforeinstallprompt` fires once, early in the page load, usually before the
 * profile page mounts. ServiceWorkerRegistrar calls `capturePwaEvents()` from the
 * root layout and this module keeps the event until a button asks for it.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Captured at first load: the auth redirect handler and tab routing can replace the
// URL (dropping the hash) before the profile card that the hash points at renders.
let initialHash = typeof window !== 'undefined' ? window.location.hash : '';

/** True once if the page was opened with this #hash; later calls return false. */
export function consumeInitialHash(id: string): boolean {
  if (initialHash !== `#${id}`) return false;
  initialHash = '';
  return true;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export function capturePwaEvents(): () => void {
  const onPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  };
  const onInstalled = () => {
    installed = true;
    deferredPrompt = null;
    emit();
  };
  window.addEventListener('beforeinstallprompt', onPrompt);
  window.addEventListener('appinstalled', onInstalled);
  return () => {
    window.removeEventListener('beforeinstallprompt', onPrompt);
    window.removeEventListener('appinstalled', onInstalled);
  };
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export type InstallState =
  | 'unknown' // server render
  | 'installed' // running as the installed app, or installed this session
  | 'prompt' // browser offered an install prompt we can trigger
  | 'ios' // iPhone/iPad Safari: Share -> Add to Home Screen
  | 'manual'; // no prompt available (Firefox, already dismissed, in-app browser)

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac with touch support
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

function readInstallState(): InstallState {
  if (installed || isStandalone()) return 'installed';
  if (deferredPrompt) return 'prompt';
  if (isIos()) return 'ios';
  return 'manual';
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, readInstallState, () => 'unknown');
}

export async function promptInstall(): Promise<boolean> {
  const event = deferredPrompt;
  if (!event) return false;
  deferredPrompt = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === 'accepted') installed = true;
  emit();
  return outcome === 'accepted';
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export type PushState =
  | 'loading'
  | 'unsupported' // no service worker / PushManager (old browser, iOS Safari tab)
  | 'needs-install' // iOS: push only works from the Home Screen app
  | 'denied' // user blocked notifications in browser settings
  | 'off'
  | 'on';

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

// One push state for the page, shared by the profile card, the checklist step and the
// strip on learning pages, so turning it on in one place updates the others.
let pushState: PushState = 'loading';
let pushCheck: Promise<void> | null = null;
const pushListeners = new Set<() => void>();

function setPushState(next: PushState) {
  pushState = next;
  pushListeners.forEach((fn) => fn());
}

function checkPushState(): Promise<void> {
  pushCheck ??= (async () => {
    if (!pushSupported()) return setPushState(isIos() && !isStandalone() ? 'needs-install' : 'unsupported');
    if (Notification.permission === 'denied') return setPushState('denied');
    const sub = await currentSubscription().catch(() => null);
    setPushState(sub && Notification.permission === 'granted' ? 'on' : 'off');
  })();
  return pushCheck;
}

function subscribePush(fn: () => void) {
  pushListeners.add(fn);
  void checkPushState();
  return () => pushListeners.delete(fn);
}

/** The setter is kept for callers that apply a result themselves; enable/disablePush already update it. */
export function usePushState(): [PushState, (s: PushState) => void] {
  return [useSyncExternalStore(subscribePush, () => pushState, () => 'loading'), setPushState];
}

/**
 * Turns push on for this device and updates every component showing the state.
 * Must run from a click handler: browsers only show the permission prompt after a user gesture.
 */
export async function enablePush(): Promise<PushState> {
  const next = await subscribeThisDevice();
  setPushState(next);
  return next;
}

export async function disablePush(): Promise<PushState> {
  const next = await unsubscribeThisDevice();
  setPushState(next);
  return next;
}

async function subscribeThisDevice(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported';
  if (!VAPID_PUBLIC_KEY) throw new Error('Notifications are not configured yet.');

  const permission = await Notification.requestPermission();
  if (permission === 'denied') return 'denied';
  if (permission !== 'granted') return 'off';

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    await sub.unsubscribe().catch(() => {});
    throw new Error(json.error || 'Could not turn on notifications.');
  }
  return 'on';
}

async function unsubscribeThisDevice(): Promise<PushState> {
  const sub = await currentSubscription();
  if (sub) {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {});
    await sub.unsubscribe();
  }
  return 'off';
}
