import { NextRequest, NextResponse } from 'next/server';
import { requireQctfEntry } from '@/lib/qctf/api';
import { getQctfMe, submitQctfFlag } from '@/lib/qctf/server';

const MAX_FLAG_LENGTH = 200;

export async function POST(req: NextRequest) {
  const ctx = await requireQctfEntry();
  if (ctx.denied) return ctx.denied;
  const { session, config, access } = ctx;

  if (!access.canSubmit) {
    const reason = config.state === 'closed' ? 'The round is closed.' : 'Flag submission is not open yet.';
    return NextResponse.json({ success: false, error: reason }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const challengeId = typeof body?.challengeId === 'string' ? body.challengeId : '';
  const flag = typeof body?.flag === 'string' ? body.flag.trim() : '';

  if (!challengeId || !flag) {
    return NextResponse.json({ success: false, error: 'Challenge and flag are required.' }, { status: 400 });
  }
  if (flag.length > MAX_FLAG_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Flags are at most ${MAX_FLAG_LENGTH} characters.` },
      { status: 400 }
    );
  }

  try {
    const me = await getQctfMe(session, config);
    if (!me.team) {
      return NextResponse.json({ success: false, error: 'Join or create a team before submitting flags.' }, { status: 400 });
    }

    const outcome = await submitQctfFlag(session, config, me.team, challengeId, flag);
    if ('error' in outcome) {
      return NextResponse.json({ success: false, error: outcome.error }, { status: outcome.status });
    }
    return NextResponse.json({ success: true, ...outcome.result });
  } catch (err) {
    console.error('[API /api/qctf/submit] Error:', err);
    return NextResponse.json({ success: false, error: 'Submission failed. Try again.' }, { status: 500 });
  }
}
