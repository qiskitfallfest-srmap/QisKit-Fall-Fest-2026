import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { loadWinnerBoards, loadYourEntries } from '@/lib/competition-winners';
import type { CompetitionWinnersResponse } from '@/lib/competition-results';

export const dynamic = 'force-dynamic';

/**
 * Winners of the daily competitions, for every signed-in participant.
 * A placement is listed once its result is released; admins also see
 * unreleased placements (released: false) so the board can be checked
 * before the announcement.
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  try {
    const boards = await loadWinnerBoards({ viewerEmail: session.email, includeUnreleased: session.isAdmin });
    // Own results follow what participants see, so an admin preview does not count as announced here
    const publicBoards = session.isAdmin
      ? boards.map((b) => ({ ...b, winners: b.winners.filter((w) => w.released) }))
      : boards;
    const body: CompetitionWinnersResponse = {
      success: true,
      boards,
      yourEntries: await loadYourEntries(session.email, publicBoards),
      preview: boards.some((b) => b.winners.some((w) => !w.released)),
    };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err: any) {
    console.error('[Competition Winners GET Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load winners.' }, { status: 500 });
  }
}
