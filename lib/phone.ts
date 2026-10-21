/** Mobile number checks shared by the contact confirmation API and profile card (client-safe). */

/**
 * Normalizes to E.164. Indian mobiles (10 digits starting 6–9, optionally with 0 / 91 / +91)
 * become +91XXXXXXXXXX; other numbers must be written with + and a country code.
 * Returns null when the number is not a plausible mobile.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  const text = (raw || '').trim();
  if (!text) return null;
  const digits = text.replace(/\D/g, '');
  let national = digits;
  if (digits.length === 11 && digits.startsWith('0')) national = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('91')) national = digits.slice(2);
  if (national.length === 10) return /^[6-9]/.test(national) ? `+91${national}` : null;
  if (text.startsWith('+') && !digits.startsWith('91') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function samePhone(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = normalizePhone(a);
  return Boolean(na) && na === normalizePhone(b);
}

/** Window event that scrolls the profile to the contact confirmation form */
export const OPEN_CONTACT_EVENT = 'open-contact';

export const PHONE_HINT = '10-digit Indian mobile, or + and country code for numbers outside India.';
