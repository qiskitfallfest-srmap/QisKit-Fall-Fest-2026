import { NextResponse } from 'next/server';
import { requireQctfEntry } from '@/lib/qctf/api';
import { getQctfMe, listQctfChallenges } from '@/lib/qctf/server';

export async function GET() {
  const ctx = await requireQctfEntry();
  if (ctx.denied) return ctx.denied;
  const { session, config } = ctx;

  try {
    const me = await getQctfMe(session, config);
    const challenges = await listQctfChallenges(session, config, me.team?.id ?? null);
    return NextResponse.json({ success: true, challenges });
  } catch (err) {
    console.error('[API /api/qctf/challenges] Error:', err);
    return NextResponse.json({ success: false, error: 'Could not load challenges.' }, { status: 500 });
  }
}
