import { cookies } from 'next/headers';
import crypto from 'crypto';
import { isEmailWhitelisted } from './redis';

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

export const COOKIE_NAME = 'qff_auth_session';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.ADMIN_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'qff-srmap-2026-auth-cryptographic-signing-key-32chars!';

export function computeSessionSignature(payloadStr: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('hex');
}

export function signSessionCookie(session: {
  email: string;
  fullName: string;
  role: string;
  isAdmin: boolean;
}): string {
  const normEmail = session.email.trim().toLowerCase();
  const payload = {
    email: normEmail,
    fullName: session.fullName,
    role: session.role,
    isAdmin: session.isAdmin,
    iat: Date.now(),
  };
  const payloadStr = JSON.stringify(payload);
  const sig = computeSessionSignature(payloadStr);
  const envelope = { ...payload, sig };
  return encodeURIComponent(JSON.stringify(envelope));
}

export function verifySessionCookieValue(cookieValue: string): {
  email: string;
  fullName: string;
  role: AuthSession['role'];
  isAdmin: boolean;
  isValidSignature: boolean;
} | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue));
    if (!parsed || typeof parsed !== 'object' || !parsed.email) return null;

    const email = String(parsed.email).trim().toLowerCase();
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);

    let isValidSignature = false;
    if (parsed.sig && typeof parsed.sig === 'string') {
      const { sig, ...rest } = parsed;
      const expectedSig = computeSessionSignature(JSON.stringify(rest));
      try {
        const sigBuf = Buffer.from(sig, 'hex');
        const expBuf = Buffer.from(expectedSig, 'hex');
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          isValidSignature = true;
        }
      } catch {
        isValidSignature = false;
      }
    }

    // Critical Security Protection: Any session claiming admin privileges MUST have a valid cryptographic signature
    if ((isSuperAdmin || parsed.isAdmin === true || parsed.role === 'admin') && !isValidSignature) {
      console.warn(`[Security Alert] Rejected unauthenticated or forged admin session for: ${email}`);
      return null;
    }

    return {
      email,
      fullName: parsed.fullName || email.split('@')[0],
      role: (parsed.role as AuthSession['role']) || (isSuperAdmin && isValidSignature ? 'admin' : 'participant'),
      isAdmin: isValidSignature && (isSuperAdmin || parsed.isAdmin === true),
      isValidSignature,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side helper to get the currently authenticated learning session.
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const verified = verifySessionCookieValue(sessionCookie.value);
    if (!verified) return null;

    const { email, fullName, role, isAdmin } = verified;
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);

    // Verify whitelist in Redis/Supabase
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      return null;
    }

    const isCleanWhitelistName =
      Boolean(whitelist.fullName) &&
      !whitelist.fullName!.includes('|') &&
      !/^\d{5,}-/.test(whitelist.fullName!);

    const resolvedFullName =
      (fullName && !fullName.includes('|'))
        ? fullName
        : (isCleanWhitelistName ? whitelist.fullName! : (fullName || whitelist.fullName || email.split('@')[0]));

    return {
      email,
      fullName: resolvedFullName,
      role: isSuperAdmin && isAdmin ? 'admin' : (whitelist.role as AuthSession['role']) || role,
      isAdmin,
    };
  } catch {
    return null;
  }
}
