/** Validation for the name printed on certificates; safe to import from client components. */

export const CERTIFICATE_NAME_TABLE = 'certificate_names';
export const CERTIFICATE_NAME_MAX = 80;

// Letters in any script, combining marks, spaces and . ' - (e.g. "K. Sai Priya", "D'Souza", "Anne-Marie")
const ALLOWED = /^[\p{L}\p{M}][\p{L}\p{M} .'\-]*$/u;

export function normalizeCertificateName(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*/g, '. ')
    .trim();
}

export function validateCertificateName(raw: string): string | null {
  const name = normalizeCertificateName(raw);
  if (name.length < 2) return 'Enter your full name.';
  if (name.length > CERTIFICATE_NAME_MAX) return `Keep it under ${CERTIFICATE_NAME_MAX} characters.`;
  if (!ALLOWED.test(name)) return 'Use letters, spaces, full stops, apostrophes and hyphens only.';
  if (!/\p{L}{2,}/u.test(name)) return 'Enter your full name, not only initials.';
  return null;
}
