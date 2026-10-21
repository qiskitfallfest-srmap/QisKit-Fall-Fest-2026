import { NextRequest, NextResponse } from 'next/server';
import { isEmailWhitelisted } from '@/lib/redis';
import { SUPER_ADMIN_EMAILS } from '@/lib/auth';
import { resolveDisplayName } from '@/lib/auth-name';
import { logError, logInfo, logWarn } from '@/lib/logger';
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  setSessionCookie,
  verifySessionCookie,
  verifySupabaseAccessToken,
} from '@/lib/session-cookie';

export const runtime = 'edge';

function unauthenticated(request: NextRequest, clearCookie: boolean) {
  const response = NextResponse.json({ authenticated: false, session: null });
  if (clearCookie) clearSessionCookie(response, request);
  return response;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false, session: null });
  }

  try {
    // Legacy unsigned, tampered, or expired cookies are rejected and cleared so the
    // client falls back to its Supabase session and re-establishes a signed cookie.
    const parsed = await verifySessionCookie(sessionCookie.value);
    if (!parsed) {
      return unauthenticated(request, true);
    }
    const email = parsed.email.trim().toLowerCase();

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      return unauthenticated(request, true);
    }

    const role = isSuperAdmin ? 'admin' : whitelist.role || 'participant';
    const resolvedFullName = resolveDisplayName(parsed.fullName, whitelist, email);

    return NextResponse.json({
      authenticated: true,
      session: {
        email,
        fullName: resolvedFullName,
        role,
        isAdmin: isSuperAdmin || role === 'admin',
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, session: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // The email is taken only from the Supabase-verified user, never from the request body.
    const verifiedUser = await verifySupabaseAccessToken(body?.accessToken);
    if (!verifiedUser) {
      logWarn('auth.session.token_rejected', {});
      return NextResponse.json(
        { error: 'Sign-in could not be verified. Please sign in with Google again.' },
        { status: 401 }
      );
    }

    const email = verifiedUser.email;
    const fullName = verifiedUser.fullName;

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      logInfo('auth.session.registration_required', { email });
      return NextResponse.json(
        {
          authenticated: false,
          requiresRegistration: true,
          email,
          fullName: fullName || email.split('@')[0],
          message: 'Please complete your quick participant profile to unlock instant access.',
        },
        { status: 200 }
      );
    }

    const role = isSuperAdmin ? 'admin' : whitelist.role || 'participant';
    // A name saved on the profile wins over the Google display name, so corrections survive sign-in
    const resolvedFullName = resolveDisplayName(fullName, whitelist, email);

    const sessionData = {
      email,
      fullName: resolvedFullName,
      role,
      isAdmin: isSuperAdmin || role === 'admin',
    };

    const response = NextResponse.json({
      success: true,
      session: sessionData,
    });

    await setSessionCookie(response, request, { email, fullName: resolvedFullName });

    return response;
  } catch (error) {
    await logError('auth.session.failed', error);
    return NextResponse.json(
      { error: 'Failed to authenticate session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  clearSessionCookie(response, request);
  return response;
}
