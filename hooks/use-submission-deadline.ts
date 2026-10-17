'use client';

import * as React from 'react';
import { ONLINE_SUBMISSIONS_CLOSE_ISO } from '@/lib/constants';

const DEADLINE_MS = Date.parse(ONLINE_SUBMISSIONS_CLOSE_ISO);

export interface SubmissionDeadlineState {
  /** False until mounted, so server and first client render agree. */
  ready: boolean;
  closed: boolean;
  remainingMs: number;
}

/**
 * Ticks once per second until the online submission window closes, then stops.
 * Pages left open across the deadline flip to the closed state without a reload.
 */
export function useSubmissionDeadline(): SubmissionDeadlineState {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    if (Date.now() > DEADLINE_MS) return;

    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t > DEADLINE_MS) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) return { ready: false, closed: false, remainingMs: 0 };
  return { ready: true, closed: now > DEADLINE_MS, remainingMs: Math.max(0, DEADLINE_MS - now) };
}
