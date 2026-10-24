'use client';

import useSWR from 'swr';
import { useCallback } from 'react';

const AGENDA_KEY = '/api/agenda';

interface AgendaResponse {
  success: boolean;
  isAuthenticated: boolean;
  sessionIds: string[];
}

const fetcher = async (url: string): Promise<AgendaResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'Could not load your agenda');
  return json;
};

/** Sessions the signed-in participant saved on /schedule. Toggles update optimistically. */
export function useAgenda(enabled: boolean) {
  const { data, mutate } = useSWR<AgendaResponse>(enabled ? AGENDA_KEY : null, fetcher, {
    revalidateOnFocus: false,
  });
  const saved = new Set(data?.sessionIds || []);

  const toggle = useCallback(
    async (sessionId: string): Promise<{ saved: boolean; error?: string }> => {
      const current = data?.sessionIds || [];
      const wasSaved = current.includes(sessionId);
      const next = wasSaved ? current.filter((id) => id !== sessionId) : [...current, sessionId];
      const optimistic = { success: true, isAuthenticated: true, sessionIds: next };

      try {
        await mutate(
          async () => {
            const res = await fetch(AGENDA_KEY, {
              method: wasSaved ? 'DELETE' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.success) throw new Error(json.error || 'Could not update your agenda.');
            return optimistic;
          },
          { optimisticData: optimistic, rollbackOnError: true, revalidate: false }
        );
        return { saved: !wasSaved };
      } catch (err: any) {
        return { saved: wasSaved, error: err?.message || 'Could not update your agenda.' };
      }
    },
    [data, mutate]
  );

  return { saved, loaded: Boolean(data), toggle };
}
