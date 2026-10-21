/**
 * Display name for a session, shared by sign-in (app/api/auth/session) and every
 * request (lib/auth getServerSession).
 *
 * 1. A name the participant saved on their profile (allowed_emails.full_name_set_at) always wins,
 *    so a correction survives the next Google sign-in and reaches their other devices.
 * 2. Otherwise the incoming name (Google display name at sign-in, cookie name afterwards),
 *    unless it is a sheet-style "roll | name" value.
 * 3. Otherwise the stored whitelist name when it looks clean, then anything available.
 */
export function resolveDisplayName(
  incoming: string | null | undefined,
  whitelist: { fullName?: string; nameSetByUser?: boolean },
  email: string
): string {
  const stored = whitelist.fullName?.trim() || '';
  if (whitelist.nameSetByUser && stored) return stored;

  const name = incoming?.trim() || '';
  if (name && !name.includes('|')) return name;

  const storedIsClean = Boolean(stored) && !stored.includes('|') && !/^\d{5,}-/.test(stored);
  if (storedIsClean) return stored;
  return name || stored || email.split('@')[0];
}
