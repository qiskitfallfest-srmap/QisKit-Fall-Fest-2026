'use client';

import { useEffect, useRef } from 'react';
import type { SubmissionEvaluation } from '@/types/evaluations';

export const EVALUATION_POLL_INTERVAL_MS = 20000;

/**
 * Polls /api/admin/evaluations and hands the rows to `onEvaluations` so that
 * evaluations made in other admin sessions show up without a full reload.
 *
 * submission_evaluations is service-role only, so the browser cannot use a
 * Supabase Realtime subscription on it. Polling is skipped while the tab is
 * hidden and runs once immediately when it becomes visible again.
 */
export function useEvaluationPolling(
  categories: readonly string[],
  onEvaluations: (evaluations: SubmissionEvaluation[]) => void
) {
  const callbackRef = useRef(onEvaluations);
  useEffect(() => {
    callbackRef.current = onEvaluations;
  }, [onEvaluations]);

  const categoryKey = categories.join(',');

  useEffect(() => {
    const allowed = new Set(categoryKey.split(','));
    // A single category can be filtered server side; several are filtered here.
    const query = allowed.size === 1 ? `?category=${encodeURIComponent(categoryKey)}` : '';
    let cancelled = false;

    const poll = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await fetch(`/api/admin/evaluations${query}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const rows: SubmissionEvaluation[] = (json.evaluations || []).filter(
          (row: SubmissionEvaluation) => allowed.has(row.category)
        );
        callbackRef.current(rows);
      } catch (err) {
        console.error('Error polling evaluations:', err);
      }
    };

    const interval = window.setInterval(poll, EVALUATION_POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [categoryKey]);
}
