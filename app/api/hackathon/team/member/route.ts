import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isEmailWhitelisted, invalidateHackathonTeamCache, invalidateEmailCache } from '@/lib/redis';

// Helper to invalidate all team member caches
async function invalidateAllTeamCaches(teamId: string, additionalEmail?: string) {
  try {
    const { data: members } = await supabase
      .from('team_members')
      .select('email')
      .eq('team_id', teamId);

    const emailSet = new Set<string>();
    if (additionalEmail) emailSet.add(additionalEmail.toLowerCase());
    (members || []).forEach((m) => {
      if (m.email) emailSet.add(m.email.toLowerCase());
    });

    for (const email of emailSet) {
      await invalidateHackathonTeamCache(email);
      await invalidateEmailCache(email);
    }
  } catch (err) {
    console.warn('Cache invalidation notice:', err);
  }
}

// ---------------------------------------------------------------------------
// POST: Add a new teammate to an existing team (Max 6 members limit)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teamId, email, fullName } = body;

    const trimmedEmail = email?.trim().toLowerCase();
    const cleanFullName = fullName?.trim() || trimmedEmail?.split('@')[0] || '';

    if (!teamId || !trimmedEmail || !trimmedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Team ID and valid teammate email are required.' },
        { status: 400 }
      );
    }

    // 1. Verify caller is authorized (must be leader or accepted member of this team)
    const { data: callerMembership } = await supabase
      .from('team_members')
      .select('role, status')
      .ilike('email', session.email)
      .eq('team_id', teamId)
      .neq('status', 'declined')
      .maybeSingle();

    if (!callerMembership) {
      return NextResponse.json(
        { error: 'You are not authorized to manage members for this team.' },
        { status: 403 }
      );
    }

    // 2. Check current team member count (Max 6 members)
    const { data: currentMembers } = await supabase
      .from('team_members')
      .select('id, email, status')
      .eq('team_id', teamId)
      .neq('status', 'declined');

    const memberCount = currentMembers?.length || 0;
    if (memberCount >= 6) {
      return NextResponse.json(
        { error: 'Team has reached the maximum capacity of 6 members.' },
        { status: 400 }
      );
    }

    // Check if email is already in this team
    if (currentMembers?.some((m) => m.email.toLowerCase() === trimmedEmail)) {
      return NextResponse.json(
        { error: `${trimmedEmail} is already in your team roster.` },
        { status: 400 }
      );
    }

    // 3. Verify teammate email is whitelisted on Unstop
    const whitelistCheck = await isEmailWhitelisted(trimmedEmail);
    if (!whitelistCheck.whitelisted) {
      return NextResponse.json(
        { error: `Teammate ${trimmedEmail} is not authorized on the event whitelist.` },
        { status: 400 }
      );
    }

    // 4. Verify teammate is not already registered in another active team
    const { data: activeTeam } = await supabase
      .from('team_members')
      .select('team_id, hackathon_teams(name)')
      .ilike('email', trimmedEmail)
      .neq('status', 'declined')
      .maybeSingle();

    if (activeTeam) {
      // @ts-expect-error join
      const conflictingTeamName = activeTeam.hackathon_teams?.name || 'another team';
      return NextResponse.json(
        { error: `${trimmedEmail} is already registered in team "${conflictingTeamName}".` },
        { status: 400 }
      );
    }

    // Clean up any stale declined row for this email to avoid unique constraint collisions
    await supabase
      .from('team_members')
      .delete()
      .ilike('email', trimmedEmail)
      .eq('status', 'declined');

    // 5. Insert new invited member
    const { data: newMember, error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        email: trimmedEmail,
        full_name: cleanFullName || whitelistCheck.fullName || trimmedEmail.split('@')[0],
        role: 'member',
        status: 'invited',
        invited_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !newMember) {
      if (insertError?.message?.includes('team_members_email_key') || (insertError as any)?.code === '23505') {
        return NextResponse.json(
          { error: `${trimmedEmail} is already registered in a team.` },
          { status: 400 }
        );
      }
      throw insertError || new Error('Failed to insert member');
    }

    // Invalidate caches
    await invalidateAllTeamCaches(teamId, trimmedEmail);

    return NextResponse.json({
      success: true,
      message: `Invitation successfully dispatched to ${trimmedEmail}.`,
      member: newMember,
    });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add team member' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE: Remove a member from an existing team (Min 2 members safeguard)
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const memberId = searchParams.get('memberId');

    if (!teamId || !memberId) {
      return NextResponse.json(
        { error: 'Team ID and Member ID are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch member to be removed
    const { data: targetMember } = await supabase
      .from('team_members')
      .select('id, team_id, email, role, status')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .maybeSingle();

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found in this team.' },
        { status: 404 }
      );
    }

    // Leader cannot be removed
    if (targetMember.role === 'leader') {
      return NextResponse.json(
        { error: 'The team leader cannot be removed. Leadership cannot be deleted.' },
        { status: 400 }
      );
    }

    // 2. Verify caller is team leader or the member removing themselves
    const { data: callerEntry } = await supabase
      .from('team_members')
      .select('role')
      .ilike('email', session.email)
      .eq('team_id', teamId)
      .neq('status', 'declined')
      .maybeSingle();

    const isLeader = callerEntry?.role === 'leader';
    const isSelf = targetMember.email.toLowerCase() === session.email.toLowerCase();

    if (!isLeader && !isSelf) {
      return NextResponse.json(
        { error: 'Only the team leader or the member themselves can perform this removal.' },
        { status: 403 }
      );
    }

    // 3. Minimum team size safeguard: team must maintain at least 2 members
    const { data: currentMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .neq('status', 'declined');

    const totalActiveMembers = currentMembers?.length || 0;
    if (totalActiveMembers <= 2) {
      return NextResponse.json(
        { error: 'Cannot remove member: Hackathon teams must maintain a minimum of 2 members.' },
        { status: 400 }
      );
    }

    // 4. Delete the member record
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      throw deleteError;
    }

    // Invalidate caches
    await invalidateAllTeamCaches(teamId, targetMember.email);

    return NextResponse.json({
      success: true,
      message: `Member ${targetMember.email} has been removed from the team.`,
    });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH: Resend invitation or update member info
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teamId, memberId, action } = body;

    if (!teamId || !memberId) {
      return NextResponse.json(
        { error: 'Team ID and Member ID are required.' },
        { status: 400 }
      );
    }

    // Verify caller is team leader
    const { data: callerEntry } = await supabase
      .from('team_members')
      .select('role')
      .ilike('email', session.email)
      .eq('team_id', teamId)
      .maybeSingle();

    if (callerEntry?.role !== 'leader') {
      return NextResponse.json(
        { error: 'Only the team leader can manage invitations.' },
        { status: 403 }
      );
    }

    // Fetch target member
    const { data: targetMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .maybeSingle();

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    if (action === 'resend') {
      const { data: updated, error: updateErr } = await supabase
        .from('team_members')
        .update({
          invited_at: new Date().toISOString(),
          status: 'invited',
        })
        .eq('id', memberId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await invalidateAllTeamCaches(teamId, targetMember.email);

      return NextResponse.json({
        success: true,
        message: `Invitation refreshed for ${targetMember.email}.`,
        member: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update member' },
      { status: 500 }
    );
  }
}
