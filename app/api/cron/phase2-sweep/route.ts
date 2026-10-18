import { NextRequest, NextResponse } from 'next/server';
import { sweepExpiredOffers } from '@/lib/phase2-waiting-room';

export const dynamic = 'force-dynamic';

// Called every few minutes by a Supabase pg_cron + pg_net job so that overdue Phase 2
// offers expire and waitlisted teams are invited even when nobody has the site open.
// Header: Authorization: Bearer <PHASE2_SWEEP_SECRET>
export async function GET(request: NextRequest) {
  const secret = process.env.PHASE2_SWEEP_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sweepExpiredOffers();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Phase 2 Sweep Error]:', err);
    return NextResponse.json({ error: err?.message || 'Sweep failed' }, { status: 500 });
  }
}
