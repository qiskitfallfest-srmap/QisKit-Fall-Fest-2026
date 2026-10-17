import { NextResponse } from 'next/server';
import { ONLINE_SUBMISSIONS_CLOSE_LABEL, isOnlineSubmissionsClosed } from '@/lib/constants';

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
