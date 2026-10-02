import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { invalidateHackathonTeamCache } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teamId, githubRepoUrl, submissionNotes } = body;

    if (!teamId || !githubRepoUrl) {
      return NextResponse.json(
        { error: 'teamId and githubRepoUrl are required.' },
        { status: 400 }
      );
    }

    const trimmedUrl = githubRepoUrl.trim();
    if (
      !trimmedUrl.startsWith('https://github.com/') &&
      !trimmedUrl.startsWith('https://gitlab.com/') &&
      !trimmedUrl.startsWith('https://huggingface.co/')
    ) {
      return NextResponse.json(
        {
          error:
            'Please provide a valid public repository link (e.g., https://github.com/organization/repo).',
        },
        { status: 400 }
      );
    }

    // Verify user is an accepted member of this team
    const { data: member, error: memberErr } = await supabase
      .from('team_members')
      .select('id, role, status')
      .eq('team_id', teamId)
      .ilike('email', session.email)
      .eq('status', 'accepted')
      .single();

    if (memberErr || !member) {
      return NextResponse.json(
        { error: 'You must be an accepted member of this team to submit code.' },
        { status: 403 }
      );
    }

    // Update repository in hackathon_teams
    const { data: updatedTeam, error: updateErr } = await supabase
      .from('hackathon_teams')
      .update({
        github_repo_url: trimmedUrl,
        submission_notes: submissionNotes?.trim() || null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Invalidate cached team data for all members of this team
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('email')
      .eq('team_id', teamId);

    const memberEmails = (teamMembers || [])
      .map((m) => m.email)
      .filter(Boolean) as string[];

    if (memberEmails.length > 0) {
      await invalidateHackathonTeamCache(memberEmails);
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub repository successfully submitted for hackathon evaluation!',
      team: updatedTeam,
    });
  } catch (error: any) {
    console.error('Error submitting github repo:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit repository' },
      { status: 500 }
    );
  }
}
