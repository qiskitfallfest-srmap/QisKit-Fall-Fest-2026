import { cookies } from 'next/headers';
import { isEmailWhitelisted } from './redis';
import { resolveDisplayName } from './auth-name';
import { SESSION_COOKIE_NAME, verifySessionCookie } from './session-cookie';

export const SUPER_ADMIN_EMAILS = [
  'qiskitfallfest@srmap.edu.in',
  'gyankumar_sah@srmap.edu.in',
];

export interface AuthSession {
  email: string;
  fullName: string;
  role: 'participant' | 'admin' | 'tester' | 'mentor';
  isAdmin: boolean;
}

/**
 * Server-side helper to get the currently authenticated learning session.
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    // Rejects legacy unsigned cookies, tampered values, and expired sessions.
    const parsed = await verifySessionCookie(sessionCookie.value);
    if (!parsed) return null;

    const email = parsed.email.trim().toLowerCase();
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);

    // Verify whitelist in Redis/Supabase
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      return null;
    }

    const role = isSuperAdmin
      ? 'admin'
      : (whitelist.role as AuthSession['role']) || 'participant';

    const resolvedFullName = resolveDisplayName(parsed.fullName, whitelist, email);

    return {
      email,
      fullName: resolvedFullName,
      role,
      isAdmin: isSuperAdmin || role === 'admin',
    };
  } catch {
    return null;
  }
}
