/** Internal (SRM AP) vs external classification, safe to import from client components. */

export type Phase2Track = 'internal' | 'external';

// Same normalization as the jury sheet (GT-37): any SRM AP spelling counts as internal
const SRM_AP_PATTERN = /\bsrm\s*(university)?[\s-]*a\.?p\b|\bsrmap\b|\bsrmist\b/i;

export function trackForLeadEmail(leadEmail: string, institution?: string | null): Phase2Track {
  const email = leadEmail.trim().toLowerCase();
  if (email.endsWith('@srmap.edu.in')) return 'internal';
  return institution && SRM_AP_PATTERN.test(institution) ? 'internal' : 'external';
}
