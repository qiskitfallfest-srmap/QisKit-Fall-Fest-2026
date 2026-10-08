import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isTeamFinalized, setTeamFinalized } from '@/lib/finalized-teams';
import { invalidateHackathonTeamCache, invalidateEmailCache } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required.' }, { status: 400 });
    }

    // 1. Verify caller is the leader of this team
    const { data: callerEntry } = await supabase
      .from('team_members')
      .select('team_id, role, status')
      .ilike('email', session.email)
      .eq('team_id', teamId)
      .maybeSingle();

    if (!callerEntry || callerEntry.role !== 'leader') {
      return NextResponse.json(
        { error: 'Only the team leader has permission to finalize the team roster.' },
        { status: 403 }
      );
    }

    // 2. Check if already finalized
    const finStatus = await isTeamFinalized(teamId);
    if (finStatus.isFinalized) {
      return NextResponse.json(
        { error: 'This team roster has already been finalized and locked.' },
        { status: 400 }
      );
    }

    // 3. Count confirmed (accepted) members
    // Teammates must accept before they count!
    const { data: allMembers } = await supabase
      .from('team_members')
      .select('id, email, role, status')
      .eq('team_id', teamId);

    const confirmedMembers = (allMembers || []).filter(
      (m) => m.status === 'accepted' || m.role === 'leader'
    );

    if (confirmedMembers.length < 2) {
      return NextResponse.json(
        {
          error: `Cannot finalize team: Teams must have at least 2 confirmed members (1 leader + at least 1 accepted teammate). Currently you have ${confirmedMembers.length} confirmed member. Please ensure your teammates accept their invitations first.`,
        },
        { status: 400 }
      );
    }

    if (confirmedMembers.length > 6) {
      return NextResponse.json(
        { error: 'Cannot finalize team: Maximum team size is 6 members.' },
        { status: 400 }
      );
    }

    // 4. Record finalization
    await setTeamFinalized(teamId, session.email);

    // 5. Invalidate caches for all members
    const emailList = (allMembers || []).map((m) => m.email).filter(Boolean) as string[];
    for (const em of emailList) {
      await invalidateHackathonTeamCache(em);
      await invalidateEmailCache(em);
    }

    return NextResponse.json({
      success: true,
      message: 'Team roster has been officially finalized and locked!',
      finalizedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error finalizing team:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to finalize team.' },
      { status: 500 }
    );
  }
}
