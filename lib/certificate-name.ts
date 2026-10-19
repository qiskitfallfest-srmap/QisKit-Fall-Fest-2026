import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeCertificateName, CERTIFICATE_NAME_TABLE } from '@/lib/certificate-name-shared';

export * from '@/lib/certificate-name-shared';

/** The confirmed certificate name, or null when none is set (or the table is not migrated yet). */
export async function getCertificateName(email: string): Promise<{ name: string; confirmedAt: string } | null> {
  const { data, error } = await supabaseAdmin
    .from(CERTIFICATE_NAME_TABLE)
    .select('certificate_name, confirmed_at')
    .eq('email', email.trim().toLowerCase())
    .limit(1);
  if (error || !data?.[0]) return null;
  return { name: data[0].certificate_name, confirmedAt: data[0].confirmed_at };
}

/** Name to print: the participant's confirmed choice, else the given fallback. */
export async function resolveCertificateName(email: string, fallback: string): Promise<string> {
  const chosen = await getCertificateName(email);
  return chosen?.name || normalizeCertificateName(fallback) || fallback;
}
