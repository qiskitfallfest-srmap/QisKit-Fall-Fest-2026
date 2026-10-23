import { NextRequest, NextResponse } from 'next/server';
import { requireQctfEntry } from '@/lib/qctf/api';
import { createQctfTeam, getQctfMe, joinQctfTeam, leaveQctfTeam } from '@/lib/qctf/server';

/** { action: 'create', name } | { action: 'join', code } | { action: 'leave' } */
export async function POST(req: NextRequest) {
  const ctx = await requireQctfEntry();
  if (ctx.denied) return ctx.denied;
  const { session, config } = ctx;

  if (config.state === 'closed') {
    return NextResponse.json({ success: false, error: 'The round is closed. Teams can no longer change.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const action = body?.action;

  try {
    let error: string | null;
    if (action === 'create') error = await createQctfTeam(config, session, String(body?.name ?? ''));
    else if (action === 'join') error = await joinQctfTeam(config, session, String(body?.code ?? ''));
    else if (action === 'leave') error = await leaveQctfTeam(config, session);
    else return NextResponse.json({ success: false, error: 'Unknown team action.' }, { status: 400 });

    if (error) return NextResponse.json({ success: false, error }, { status: 400 });
    const me = await getQctfMe(session, config);
    return NextResponse.json({ success: true, me });
  } catch (err) {
    console.error('[API /api/qctf/team] Error:', err);
    return NextResponse.json({ success: false, error: 'Could not update your team.' }, { status: 500 });
  }
}
