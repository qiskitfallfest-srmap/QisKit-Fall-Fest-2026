import { supabase } from './supabase';

export interface FinalizedTeamInfo {
  finalized_at: string;
  finalized_by: string;
}

/**
 * Retrieves the mapping of finalized teams from Supabase platform_config.
 */
export async function getFinalizedTeamsMap(): Promise<Record<string, FinalizedTeamInfo>> {
  try {
    const { data, error } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'finalized_teams')
      .maybeSingle();

    if (error) {
      console.warn('[FinalizedTeams] Notice reading platform_config:', error.message);
      return {};
    }

    if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
      return data.value as Record<string, FinalizedTeamInfo>;
    }
  } catch (err) {
    console.error('[FinalizedTeams] Error fetching finalized teams config:', err);
  }
  return {};
}

/**
 * Checks whether a specific team ID has been finalized.
 */
export async function isTeamFinalized(
  teamId: string
): Promise<{ isFinalized: boolean; finalizedAt?: string; finalizedBy?: string }> {
  if (!teamId) return { isFinalized: false };
  const map = await getFinalizedTeamsMap();
  const info = map[teamId];
  if (info) {
    return {
      isFinalized: true,
      finalizedAt: info.finalized_at,
      finalizedBy: info.finalized_by,
    };
  }
  return { isFinalized: false };
}

/**
 * Marks a team as permanently finalized in platform_config.
 */
export async function setTeamFinalized(teamId: string, finalizedBy: string): Promise<boolean> {
  if (!teamId) throw new Error('teamId is required to finalize');
  const map = await getFinalizedTeamsMap();
  map[teamId] = {
    finalized_at: new Date().toISOString(),
    finalized_by: finalizedBy || 'leader',
  };

  const { error } = await supabase
    .from('platform_config')
    .upsert({
      key: 'finalized_teams',
      value: map,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[FinalizedTeams] Error saving finalized status:', error);
    throw error;
  }

  return true;
}
