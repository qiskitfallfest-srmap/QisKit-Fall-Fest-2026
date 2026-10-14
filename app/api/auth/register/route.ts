import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { redis, invalidateEmailCache } from '@/lib/redis';
import { SUPER_ADMIN_EMAILS } from '@/lib/auth';
import { logError, logInfo, logWarn, serializeError } from '@/lib/logger';

const COOKIE_NAME = 'qff_auth_session';

export const runtime = 'edge';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const fullName = body.fullName?.trim() || '';
    const role = body.role?.trim() || 'Undergraduate Student';
    const institution = body.institution?.trim() || 'SRM University-AP';
    const phone = body.phone?.trim() || '';
    const yearOfStudy = body.yearOfStudy?.trim() || null;
    const interests = Array.isArray(body.interests) ? body.interests : [];

    // Validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!institution || institution.length < 2) {
      return NextResponse.json({ error: 'Please enter your college, university, or organization.' }, { status: 400 });
    }

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return NextResponse.json({ error: 'Please enter a valid WhatsApp or contact phone number.' }, { status: 400 });
    }

    // 1. Insert or update record in public.registrations
    const { error: regError } = await supabase
      .from('registrations')
      .insert({
        name: fullName,
        email,
        institution,
        role,
        phone,
        year_of_study: yearOfStudy,
        interests,
      });

    if (regError) {
      logWarn('auth.register.registrations_insert_failed', { email, error: serializeError(regError) });
      // Non-fatal if table write fails; continue to ensure student gets access
    }

    // 2. Safely add or update in public.allowed_emails
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const assignedRole = isSuperAdmin ? 'admin' : 'participant';

    const { error: whitelistError } = await supabase
      .from('allowed_emails')
      .upsert(
        {
          email,
          full_name: fullName,
          role: assignedRole,
          is_active: true,
          added_by: 'self_registration',
        },
        { onConflict: 'email' }
      );

    if (whitelistError) {
      await logError('auth.register.whitelist_upsert_failed', whitelistError, { email });
      return NextResponse.json(
        { error: 'Failed to complete registration. Please try again.' },
        { status: 500 }
      );
    }

    // 3. Invalidate & populate Redis cache
    await invalidateEmailCache(email);
    if (redis) {
      try {
        await redis.set(
          `whitelist:${email}`,
          { whitelisted: true, role: assignedRole, fullName },
          { ex: 3600 }
        );
      } catch (cacheErr) {
        logWarn('auth.register.cache_set_failed', { email, error: serializeError(cacheErr) });
      }
    }
    logInfo('auth.register.success', { email, institution });

    // 3b. Dispatch Confirmation Pass Email via Google Apps Script Web App Relay
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL;
    if (appsScriptUrl) {
      try {
        const syncSecret = process.env.GOOGLE_FORM_SYNC_SECRET || 'qff-srmap-2026-sync-secret';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const emailRes = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_welcome_email',
            secretToken: syncSecret,
            name: fullName,
            email,
            institution,
            role,
            phone,
            yearOfStudy,
            interests,
            source: 'website_direct',
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const emailResult = await emailRes.json().catch(() => null);
        logInfo('auth.register.email_relay', { email, ok: emailRes.ok, result: emailResult });
      } catch (emailErr) {
        logWarn('auth.register.email_relay_failed', { email, error: serializeError(emailErr) });
      }
    }

    // 4. Create authenticated session cookie
    const sessionData = {
      email,
      fullName,
      role: assignedRole,
      isAdmin: isSuperAdmin,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Welcome to IBM Qiskit Fall Fest 2026.',
      session: sessionData,
    });

    const isSecure = isRequestSecure(request);
    const domain = getCookieDomain(request);

    // Set cookie for 14 days
    response.cookies.set({
      name: COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sessionData)),
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
      ...(domain ? { domain } : {}),
    });

    return response;
  } catch (err: any) {
    await logError('auth.register.failed', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
