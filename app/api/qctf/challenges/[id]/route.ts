import { NextRequest, NextResponse } from 'next/server';
import { requireQctfEntry } from '@/lib/qctf/api';
import { getQctfChallenge, getQctfMe } from '@/lib/qctf/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireQctfEntry();
  if (ctx.denied) return ctx.denied;
  const { session, config } = ctx;
  const { id } = await params;

  try {
    const me = await getQctfMe(session, config);
    const challenge = await getQctfChallenge(session, config, id, me.team?.id ?? null);
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, challenge });
  } catch (err) {
    console.error('[API /api/qctf/challenges/[id]] Error:', err);
    return NextResponse.json({ success: false, error: 'Could not load this challenge.' }, { status: 500 });
  }
}
