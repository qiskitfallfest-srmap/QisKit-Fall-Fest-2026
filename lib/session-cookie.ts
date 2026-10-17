import type { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Signed session cookie helpers.
 *
 * Cookie format: v1.<base64url(JSON payload)>.<base64url(HMAC-SHA256)>
 * The HMAC covers "v1.<payload>" and is keyed with SESSION_SECRET.
 * Uses Web Crypto only so it runs on both the edge and node runtimes.
 */

export const SESSION_COOKIE_NAME = 'qff_auth_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

const COOKIE_VERSION = 'v1';
const DEV_FALLBACK_SECRET = 'qff-dev-only-session-secret-do-not-use-in-production';

export interface SessionCookiePayload {
  email: string;
  fullName?: string;
  iat: number;
  exp: number;
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== 'production') {
    if (!secret) {
      console.warn('[Session] SESSION_SECRET is not set; using development-only fallback secret.');
    }
    return secret || DEV_FALLBACK_SECRET;
  }
  console.error('[Session] SESSION_SECRET is missing or shorter than 32 characters; sessions are disabled.');
  return null;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSessionCookie(data: { email: string; fullName?: string }): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) throw new Error('SESSION_SECRET is not configured');

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionCookiePayload = {
    email: data.email.trim().toLowerCase(),
    fullName: data.fullName,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const body = `${COOKIE_VERSION}.${base64UrlEncode(encoder.encode(JSON.stringify(payload)))}`;
  const key = await importKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));
  return `${body}.${base64UrlEncode(sig)}`;
}

/**
 * Returns the payload only when the signature is valid and the cookie has not expired.
 * Legacy unsigned cookies (URI-encoded JSON) and tampered values return null.
 */
export async function verifySessionCookie(value: string | undefined | null): Promise<SessionCookiePayload | null> {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3 || parts[0] !== COOKIE_VERSION) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  try {
    const key = await importKey(secret);
    // crypto.subtle.verify does a constant-time comparison
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(base64UrlDecode(parts[1]))) as SessionCookiePayload;
    if (typeof payload.email !== 'string' || !payload.email.includes('@')) return null;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookieDomain(req: NextRequest): string | undefined {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.hostname;
  if (host && host.includes('qffsrmap2026.com')) {
    return '.qffsrmap2026.com';
  }
  return undefined;
}

function isRequestSecure(req: NextRequest): boolean {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) {
    return proto === 'https';
  }
  return req.nextUrl.protocol === 'https:';
}

export async function setSessionCookie(
  response: NextResponse,
  request: NextRequest,
  data: { email: string; fullName?: string }
): Promise<void> {
  const domain = getCookieDomain(request);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: await signSessionCookie(data),
    httpOnly: true,
    secure: isRequestSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    ...(domain ? { domain } : {}),
  });
}

/** Clears both the host-only cookie and the shared-domain cookie. */
export function clearSessionCookie(response: NextResponse, request: NextRequest): void {
  const domain = getCookieDomain(request);
  const isSecure = isRequestSecure(request);

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  if (domain) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      domain,
      maxAge: 0,
    });
  }
}

/**
 * Verifies a Supabase access token from the client OAuth flow against Supabase Auth
 * and returns the verified user's email and display name. Returns null on any failure.
 */
export async function verifySupabaseAccessToken(
  accessToken: unknown
): Promise<{ email: string; fullName: string } | null> {
  if (typeof accessToken !== 'string' || accessToken.length < 20) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jpciyrodeppqpkwqblpk.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_wjeOXSiT7E63DsDqTaL1cw_JBMTC3kj';

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await client.auth.getUser(accessToken);
  const user = data?.user;
  if (error || !user?.email) return null;

  const meta = user.user_metadata || {};
  const fullName = String(meta.full_name || meta.name || meta.preferred_username || '').trim();
  return { email: user.email.trim().toLowerCase(), fullName };
}
