import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { invalidateEmailCache } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { invitationId, action } = body;

    if (!invitationId || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid invitationId and action ("accept" or "decline") are required.' },
        { status: 400 }
      );
    }

    // Verify invitation belongs to this user
    const { data: invite, error: fetchErr } = await supabase
      .from('team_members')
      .select('id, team_id, email, status')
      .eq('id', invitationId)
      .ilike('email', session.email)
      .single();

    if (fetchErr || !invite) {
      return NextResponse.json(
        { error: 'Invitation not found or does not belong to you.' },
        { status: 404 }
      );
    }

    if (invite.status !== 'invited') {
      return NextResponse.json(
        { error: `This invitation has already been ${invite.status}.` },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    const { data: updated, error: updateErr } = await supabase
      .from('team_members')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Invalidate caches for all members in the team so team rosters stay consistent
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('email')
      .eq('team_id', invite.team_id);

    const memberEmails = new Set<string>([session.email]);
    (teamMembers || []).forEach((m) => {
      if (m.email) memberEmails.add(m.email.toLowerCase());
    });

    await Promise.all(Array.from(memberEmails).map((e) => invalidateEmailCache(e)));

    return NextResponse.json({
      success: true,
      action,
      status: newStatus,
      message:
        action === 'accept'
          ? 'You have joined the team! The problem statement dossier is now unlocked.'
          : 'You have declined the team invitation.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process invitation response' },
      { status: 500 }
    );
  }
}
