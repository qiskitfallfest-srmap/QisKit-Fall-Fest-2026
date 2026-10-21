import { supabaseAdmin } from '@/lib/supabase-admin';
import { samePhone } from '@/lib/phone';

export interface ContactStatus {
  phone: string | null;
  /** The stored phone is the one the participant confirmed */
  confirmed: boolean;
  emergencyName: string | null;
  emergencyPhone: string | null;
  /** False until migration 20261021150000 is applied; callers then skip the confirmation gate */
  tracked: boolean;
}

const CONTACT_COLUMNS = 'email, phone, created_at, phone_confirmed_at, phone_confirmed_value, emergency_contact_name, emergency_contact_phone';

export function contactFromRow(reg: any, tracked = true): ContactStatus {
  const phone: string | null = reg?.phone?.trim() || null;
  return {
    phone,
    confirmed: tracked && Boolean(reg?.phone_confirmed_at) && samePhone(reg?.phone_confirmed_value, phone),
    emergencyName: reg?.emergency_contact_name || null,
    emergencyPhone: reg?.emergency_contact_phone || null,
    tracked,
  };
}

/** Contact status for each email, from the oldest registrations row (the one /api/user/overview shows). */
export async function contactStatuses(emails: string[]): Promise<Map<string, ContactStatus>> {
  const wanted = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
  const regs = new Map<string, any>();
  let tracked = true;
  for (let i = 0; i < wanted.length; i += 100) {
    const chunk = wanted.slice(i, i + 100);
    let res: { data: any[] | null; error: any } = await supabaseAdmin
      .from('registrations')
      .select(CONTACT_COLUMNS)
      .in('email', chunk)
      .order('created_at', { ascending: true });
    if (res.error) {
      tracked = false;
      res = await supabaseAdmin.from('registrations').select('email, phone, created_at').in('email', chunk).order('created_at', { ascending: true });
    }
    for (const r of res.data || []) {
      const key = String(r.email).trim().toLowerCase();
      if (!regs.has(key)) regs.set(key, r);
    }
  }
  return new Map(wanted.map((e) => [e, contactFromRow(regs.get(e), tracked)]));
}

export async function contactStatus(email: string): Promise<ContactStatus> {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select(CONTACT_COLUMNS)
    .ilike('email', email)
    .order('created_at', { ascending: true })
    .limit(1);
  if (error) return contactFromRow(null, false);
  return contactFromRow(data?.[0]);
}

/** Contact columns for the admin follow-up lists; a confirmed number wins over older ones */
export function contactFields(c: ContactStatus | undefined, fallbackPhone: string | null | undefined) {
  return {
    phone: (c?.confirmed ? c.phone : c?.phone || fallbackPhone) || null,
    phoneConfirmed: Boolean(c?.confirmed),
    emergencyName: c?.emergencyName || null,
    emergencyPhone: c?.emergencyPhone || null,
  };
}

/** Bus travel and accommodation answers are locked until the submitter confirms their own number. */
export async function requireConfirmedContact(email: string): Promise<string | null> {
  const status = await contactStatus(email);
  if (!status.tracked) return null;
  return status.confirmed && status.emergencyPhone
    ? null
    : 'Confirm your mobile number and emergency contact on your profile first.';
}
