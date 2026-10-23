import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getQctfConfig, getQctfMe } from '@/lib/qctf/server';

/** The caller's arena access and team. Joins hackathon teammates to their QCTF team on first visit. */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const config = await getQctfConfig();
    const me = await getQctfMe(session, config);
    return NextResponse.json({ success: true, me });
  } catch (err) {
    console.error('[API /api/qctf/me] Error:', err);
    return NextResponse.json({ success: false, error: 'Could not load your QCTF status.' }, { status: 500 });
  }
}
