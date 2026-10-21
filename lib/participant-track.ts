/** Internal (SRM AP) vs external classification, safe to import from client components. */

export type Phase2Track = 'internal' | 'external';

// Same normalization as the jury sheet (GT-37): any SRM AP spelling counts as internal
const SRM_AP_PATTERN = /\bsrm\s*(university)?[\s-]*a\.?p\b|\bsrmap\b|\bsrmist\b/i;

export function isSrmApEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@srmap.edu.in');
}

export function isSrmApParticipant(
  email: string | null | undefined,
  institution?: string | null | undefined
): boolean {
  if (isSrmApEmail(email)) return true;
  if (!institution) return false;
  return SRM_AP_PATTERN.test(institution.trim());
}

export function trackForLeadEmail(leadEmail: string, institution?: string | null): Phase2Track {
  const email = leadEmail.trim().toLowerCase();
  if (isSrmApParticipant(email, institution)) return 'internal';
  return 'external';
}
