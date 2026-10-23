import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getQctfConfig, getQctfScoreboard } from '@/lib/qctf/server';
import type { QctfScoreboard } from '@/data/qctf/tracks';

/**
 * Public scoreboard for the projector and the arena: team names and points only.
 * Empty while the arena is hidden. Admins get the unfrozen standings with ?live=1.
 */
export async function GET(req: Request) {
  try {
    const config = await getQctfConfig();
    if (config.state === 'hidden') {
      const empty: QctfScoreboard = {
        state: config.state,
        frozenAt: null,
        generatedAt: new Date().toISOString(),
        entries: [],
        recentSolves: [],
      };
      return NextResponse.json({ success: true, scoreboard: empty });
    }

    let live = false;
    if (new URL(req.url).searchParams.get('live') === '1') {
      const session = await getServerSession();
      live = Boolean(session?.isAdmin);
    }

    const scoreboard = await getQctfScoreboard(config, { live });
    return NextResponse.json({ success: true, scoreboard });
  } catch (err) {
    console.error('[API /api/qctf/scoreboard] Error:', err);
    return NextResponse.json({ success: false, error: 'Could not load the scoreboard.' }, { status: 500 });
  }
}
