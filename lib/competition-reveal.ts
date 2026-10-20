import { supabaseAdmin } from '@/lib/supabase-admin';

// Online competition results are announced at the Valedictory Ceremony.
// Releasing an entry (result_released_at) records the decision; participants
// and the public pages see released results only from the reveal time on.
// platform_config value: { revealAt: ISO string }
export const RESULTS_REVEAL_CONFIG_KEY = 'competition_results_reveal';

/** 30 Oct 2026, 2:00 PM IST: after the vote of thanks (1:50 PM) closes the ceremony. */
export const DEFAULT_RESULTS_REVEAL_ISO = '2026-10-30T14:00:00+05:30';

export async function getResultsRevealAt(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('platform_config')
    .select('value')
    .eq('key', RESULTS_REVEAL_CONFIG_KEY)
    .maybeSingle();
  const iso = !error && typeof (data?.value as any)?.revealAt === 'string' ? (data!.value as any).revealAt : null;
  return iso && !Number.isNaN(Date.parse(iso)) ? iso : DEFAULT_RESULTS_REVEAL_ISO;
}

export async function getResultsReveal(): Promise<{ revealAt: string; revealed: boolean }> {
  const revealAt = await getResultsRevealAt();
  return { revealAt, revealed: Date.now() >= Date.parse(revealAt) };
}

export async function setResultsRevealAt(iso: string, by: string): Promise<void> {
  const { error } = await supabaseAdmin.from('platform_config').upsert(
    { key: RESULTS_REVEAL_CONFIG_KEY, value: { revealAt: new Date(iso).toISOString(), updatedBy: by }, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) throw error;
}
