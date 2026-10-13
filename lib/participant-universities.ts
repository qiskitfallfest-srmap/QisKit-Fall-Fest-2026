import { supabase } from './supabase';

/**
 * Helper to fetch the mapping of participant email -> university / institution.
 * Uses Supabase `platform_config` under the key 'participant_universities'.
 */
export async function getParticipantUniversitiesMap(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'participant_universities')
      .maybeSingle();

    if (error) {
      console.warn('[ParticipantUniversities] Notice reading platform_config:', error.message);
      return {};
    }

    if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
      return data.value as Record<string, string>;
    }
  } catch (err) {
    console.error('[ParticipantUniversities] Error fetching universities config:', err);
  }
  return {};
}

/**
 * Gets the university / institution for a specific participant email.
 * Defaults to 'SRM University-AP' if domain is @srmap.edu.in or if not specified.
 */
export async function getParticipantUniversity(email: string): Promise<string> {
  if (!email) return 'SRM University-AP';
  const cleanEmail = email.trim().toLowerCase();
  
  const map = await getParticipantUniversitiesMap();
  if (map[cleanEmail]) {
    return map[cleanEmail];
  }

  if (cleanEmail.endsWith('@srmap.edu.in')) {
    return 'SRM University-AP';
  }

  return 'SRM University-AP';
}

/**
 * Saves or updates university / institution names for a list of participants.
 * Persists in platform_config (participant_universities) and syncs to registrations table.
 */
export async function saveParticipantUniversities(
  entries: Array<{ email: string; university: string; fullName?: string }>
): Promise<void> {
  if (!entries || entries.length === 0) return;

  const validEntries = entries.filter((e) => e.email && e.university?.trim());
  if (validEntries.length === 0) return;

  const map = await getParticipantUniversitiesMap();
  for (const entry of validEntries) {
    const cleanEmail = entry.email.trim().toLowerCase();
    const cleanUni = entry.university.trim();
    if (cleanEmail && cleanUni) {
      map[cleanEmail] = cleanUni;
    }
  }

  try {
    // 1. Save to platform_config
    const { error: configError } = await supabase
      .from('platform_config')
      .upsert({
        key: 'participant_universities',
        value: map,
        updated_at: new Date().toISOString(),
      });

    if (configError) {
      console.error('[ParticipantUniversities] Error updating platform_config:', configError);
    }

    // 2. Also upsert into registrations table for relational persistence
    for (const entry of validEntries) {
      const cleanEmail = entry.email.trim().toLowerCase();
      const cleanUni = entry.university.trim();
      const cleanName = entry.fullName?.trim() || cleanEmail.split('@')[0];

      try {
        await supabase
          .from('registrations')
          .upsert(
            {
              email: cleanEmail,
              name: cleanName,
              institution: cleanUni,
              role: 'participant',
              created_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
      } catch (regErr) {
        // Non-fatal if unique constraint differs on registrations table
        console.warn('[ParticipantUniversities] Notice syncing registration:', regErr);
      }
    }
  } catch (err) {
    console.error('[ParticipantUniversities] Error persisting participant universities:', err);
  }
}
