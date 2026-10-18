import { NextResponse } from 'next/server';
import { ONLINE_SUBMISSIONS_CLOSE_LABEL, isOnlineSubmissionsClosed } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface UserCompetitionOverride {
  hasExtension: boolean;
  expiresAt?: string;
  deadlineLabel?: string;
}

/**
 * Checks if a specific user has an active online competition submission extension.
 */
export async function getUserCompetitionOverride(
  email?: string | null
): Promise<UserCompetitionOverride | null> {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  try {
    const { data, error } = await supabaseAdmin
      .from('platform_config')
      .select('value')
      .eq('key', 'competition_submission_overrides')
      .maybeSingle();

    if (error || !data?.value) return null;
    const overrides = data.value as Record<string, { expires_at?: string; label?: string }>;
    const userConfig = overrides[normalized];

    if (userConfig?.expires_at) {
      const expiresMs = Date.parse(userConfig.expires_at);
      if (!Number.isNaN(expiresMs) && Date.now() <= expiresMs) {
        return {
          hasExtension: true,
          expiresAt: userConfig.expires_at,
          deadlineLabel: userConfig.label || '18 October 2026, 11:59 PM IST',
        };
      }
    }
  } catch (err) {
    console.warn('[SubmissionWindow] Error checking user competition override:', err);
  }

  return null;
}

/**
 * Server-side gate for the online competitions and Hackathon Phase 1.
 * Returns a 403 response once the window has closed, otherwise null.
 */
export function rejectIfOnlineSubmissionsClosed(action: string): NextResponse | null {
  if (!isOnlineSubmissionsClosed()) return null;
  return NextResponse.json(
    {
      error: `${action} closed on ${ONLINE_SUBMISSIONS_CLOSE_LABEL}.`,
      code: 'SUBMISSIONS_CLOSED',
    },
    { status: 403 }
  );
}

/**
 * Server-side gate for online competitions that accounts for per-user extensions.
 */
export async function rejectIfCompetitionSubmissionsClosedForUser(
  action: string,
  email?: string | null
): Promise<NextResponse | null> {
  if (!isOnlineSubmissionsClosed()) return null;

  if (email) {
    const override = await getUserCompetitionOverride(email);
    if (override?.hasExtension) {
      return null;
    }
  }

  return NextResponse.json(
    {
      error: `${action} closed on ${ONLINE_SUBMISSIONS_CLOSE_LABEL}.`,
      code: 'SUBMISSIONS_CLOSED',
    },
    { status: 403 }
  );
}
