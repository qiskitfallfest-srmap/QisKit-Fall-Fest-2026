import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { findOfflineSession, isBreak } from '@/data/schedule.utils';

export const dynamic = 'force-dynamic';

const MAX_SAVED = 80;

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

/** GET → { sessionIds } saved by the signed-in participant (empty when signed out). */
export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ success: true, isAuthenticated: false, sessionIds: [] });
  const email = session.email.trim().toLowerCase();

  const { data, error } = await supabaseAdmin.from('schedule_agenda').select('session_id').eq('email', email);
  if (error && !isMissingTable(error)) {
    console.error('[Agenda GET Error]:', error);
    return NextResponse.json({ error: 'Could not load your agenda.' }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    isAuthenticated: true,
    sessionIds: (data || []).map((row) => row.session_id),
  });
}

function readSessionId(body: any): string | null {
  const id = typeof body?.sessionId === 'string' ? body.sessionId : '';
  const timed = id ? findOfflineSession(id) : undefined;
  return timed && !isBreak(timed.session) ? id : null;
}

/** POST { sessionId } saves a session. */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Sign in to save sessions.' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  const sessionId = readSessionId(await request.json().catch(() => ({})));
  if (!sessionId) return NextResponse.json({ error: 'Unknown session.' }, { status: 400 });

  const { count } = await supabaseAdmin
    .from('schedule_agenda')
    .select('id', { count: 'exact', head: true })
    .eq('email', email);
  if ((count || 0) >= MAX_SAVED) {
    return NextResponse.json({ error: 'Your agenda is full.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('schedule_agenda')
    .upsert({ email, session_id: sessionId }, { onConflict: 'email,session_id', ignoreDuplicates: true });
  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({ error: 'Saving sessions is not open yet. Try again later.' }, { status: 503 });
    }
    console.error('[Agenda POST Error]:', error);
    return NextResponse.json({ error: 'Could not save this session.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

/** DELETE { sessionId } removes a saved session. */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Sign in to edit your agenda.' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  const sessionId = readSessionId(await request.json().catch(() => ({})));
  if (!sessionId) return NextResponse.json({ error: 'Unknown session.' }, { status: 400 });

  const { error } = await supabaseAdmin.from('schedule_agenda').delete().eq('email', email).eq('session_id', sessionId);
  if (error && !isMissingTable(error)) {
    console.error('[Agenda DELETE Error]:', error);
    return NextResponse.json({ error: 'Could not remove this session.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
