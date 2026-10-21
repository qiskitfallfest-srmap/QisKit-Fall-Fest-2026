'use client';

import { useEffect } from 'react';
import { capturePwaEvents } from '@/lib/pwa';

/** Registers /sw.js and holds the install prompt for the profile's App card. Renders nothing. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    const release = capturePwaEvents();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err);
      });
    }
    return release;
  }, []);

  return null;
}
