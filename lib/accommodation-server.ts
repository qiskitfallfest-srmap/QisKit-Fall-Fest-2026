import { supabaseAdmin } from '@/lib/supabase-admin';

export interface CurrentInstitution {
  institution: string | null;
  /** Participant answered the profile banner (confirmed or edited) for this exact value */
  confirmed: boolean;
  confirmSource: 'confirmed' | 'edited' | null;
  phone: string | null;
}

/**
 * Institution to use for each email. A value the participant confirmed or edited on
 * /learning/profile wins over the participant_universities map, which was imported from
 * team sheets and is what the profile banner asks people to correct.
 */
export async function currentInstitutionDetails(
  emails: string[],
  universities: Record<string, string>
): Promise<Map<string, CurrentInstitution>> {
  const wanted = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
  const regs = new Map<string, any>();

  // Chunked so the PostgREST query string stays short; oldest row per email, matching /api/user/overview
  for (let i = 0; i < wanted.length; i += 100) {
    const chunk = wanted.slice(i, i + 100);
    let res: { data: any[] | null; error: any } = await supabaseAdmin
      .from('registrations')
      .select('email, institution, phone, created_at, institution_confirmed_at, institution_confirmed_value, institution_confirm_source')
      .in('email', chunk)
      .order('created_at', { ascending: true });
    if (res.error) {
      // Migration 20261021120000 not applied yet: no confirmation data
      res = await supabaseAdmin
        .from('registrations')
        .select('email, institution, phone, created_at')
        .in('email', chunk)
        .order('created_at', { ascending: true });
    }
    for (const r of res.data || []) {
      const key = String(r.email).trim().toLowerCase();
      if (!regs.has(key)) regs.set(key, r);
    }
  }

  const out = new Map<string, CurrentInstitution>();
  for (const email of wanted) {
    const reg = regs.get(email);
    const regInstitution: string | null = reg?.institution?.trim() || null;
    const confirmed =
      Boolean(reg?.institution_confirmed_at) &&
      (reg?.institution_confirmed_value || '').trim().toLowerCase() === (regInstitution || '').toLowerCase();
    out.set(email, {
      institution: confirmed ? regInstitution : universities[email] || regInstitution,
      confirmed,
      confirmSource: confirmed ? reg.institution_confirm_source || null : null,
      phone: reg?.phone?.trim() || null,
    });
  }
  return out;
}

export async function currentInstitutions(
  emails: string[],
  universities: Record<string, string>
): Promise<Map<string, string | null>> {
  const details = await currentInstitutionDetails(emails, universities);
  return new Map(Array.from(details, ([email, d]) => [email, d.institution]));
}
