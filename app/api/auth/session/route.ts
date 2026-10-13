import { NextRequest, NextResponse } from 'next/server';
import { isEmailWhitelisted } from '@/lib/redis';
import {
  SUPER_ADMIN_EMAILS,
  COOKIE_NAME,
  signSessionCookie,
  verifySessionCookieValue,
} from '@/lib/auth';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false, session: null });
  }

  try {
    const verified = verifySessionCookieValue(sessionCookie.value);
    if (!verified) {
      return NextResponse.json({ authenticated: false, session: null });
    }

    const { email, fullName, role, isAdmin } = verified;
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      return NextResponse.json({ authenticated: false, session: null });
    }

    const isCleanWhitelistName =
      Boolean(whitelist.fullName) &&
      !whitelist.fullName!.includes('|') &&
      !/^\d{5,}-/.test(whitelist.fullName!);

    const resolvedFullName =
      (fullName && !fullName.includes('|'))
        ? fullName
        : (isCleanWhitelistName ? whitelist.fullName! : (fullName || whitelist.fullName || email.split('@')[0]));

    return NextResponse.json({
      authenticated: true,
      session: {
        email,
        fullName: resolvedFullName,
        role: isSuperAdmin && isAdmin ? 'admin' : (whitelist.role || role),
        isAdmin,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, session: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const fullName = body.fullName?.trim() || '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
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

    // Verify admin credentials if attempting to claim super-admin access
    let isVerifiedAdmin = false;
    if (isSuperAdmin) {
      const authHeader = request.headers.get('authorization') || '';
      const adminSecretHeader = request.headers.get('x-admin-secret') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '') || body.authToken || '';
      const serverAdminSecret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (serverAdminSecret && (adminSecretHeader === serverAdminSecret || body.adminSecret === serverAdminSecret)) {
        isVerifiedAdmin = true;
      } else if (token) {
        try {
          const { supabaseAdmin } = await import('@/lib/supabase-admin');
          const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
          if (!userErr && userData?.user?.email?.toLowerCase() === email) {
            isVerifiedAdmin = true;
          }
        } catch {}
      }
    }

    const effectiveIsAdmin = isSuperAdmin ? isVerifiedAdmin : (whitelist.role === 'admin');
    const role = effectiveIsAdmin ? 'admin' : (whitelist.role || 'participant');
    const isCleanWhitelistName =
      Boolean(whitelist.fullName) &&
      !whitelist.fullName!.includes('|') &&
      !/^\d{5,}-/.test(whitelist.fullName!);

    const resolvedFullName =
      (fullName && !fullName.includes('|'))
        ? fullName
        : (isCleanWhitelistName ? whitelist.fullName! : (fullName || whitelist.fullName || email.split('@')[0]));

    const sessionData = {
      email,
      fullName: resolvedFullName,
      role: role as 'participant' | 'admin' | 'tester' | 'mentor',
      isAdmin: effectiveIsAdmin,
    };

    const response = NextResponse.json({
      success: true,
      session: sessionData,
    });

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

    const isSecure = isRequestSecure(request);
    const domain = getCookieDomain(request);

    // Set signed tamper-proof cookie for 14 days
    response.cookies.set({
      name: COOKIE_NAME,
      value: signSessionCookie(sessionData),
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
      ...(domain ? { domain } : {}),
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.hostname;
  const domain = host && host.includes('qffsrmap2026.com') ? '.qffsrmap2026.com' : undefined;
  const proto = request.headers.get('x-forwarded-proto');
  const isSecure = proto ? proto === 'https' : request.nextUrl.protocol === 'https:';

  // Clear host-only cookie
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Also clear shared domain cookie if applicable
  if (domain) {
    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      domain,
      maxAge: 0,
    });
  }

  return response;
}
