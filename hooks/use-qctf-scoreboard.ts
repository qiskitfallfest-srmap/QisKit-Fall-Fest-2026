'use client';

import useSWR from 'swr';
import type { QctfScoreboard } from '@/data/qctf/tracks';

async function fetchScoreboard(url: string): Promise<QctfScoreboard> {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Could not load the scoreboard.');
  return data.scoreboard;
}

/** Polls the public QCTF scoreboard. `live` asks for unfrozen standings (admins only). */
export function useQctfScoreboard({ refreshMs = 15000, live = false }: { refreshMs?: number; live?: boolean } = {}) {
  return useSWR<QctfScoreboard>(live ? '/api/qctf/scoreboard?live=1' : '/api/qctf/scoreboard', fetchScoreboard, {
    refreshInterval: refreshMs,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
}
