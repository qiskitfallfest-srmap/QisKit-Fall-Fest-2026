import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  getCompetitionSubmissionsCached,
  invalidateCompetitionSubmissionsCache,
} from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const normalizedEmail = session.email.trim().toLowerCase();

  try {
    const submissionsMap = await getCompetitionSubmissionsCached(
      normalizedEmail,
      async () => {
        const { data, error } = await supabase
          .from('competition_submissions')
          .select('*')
          .ilike('email', normalizedEmail);

        if (error) throw error;

        const map: Record<string, any> = {};
        (data || []).forEach((sub) => {
          map[sub.competition_type] = sub;
        });
        return map;
      }
    );

    return NextResponse.json(
      {
        submissions: submissionsMap,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const normalizedEmail = session.email.trim().toLowerCase();

  try {
    const body = await request.json();
    const { competitionType, submissionUrl, submissionTitle, notes } = body;

    if (!competitionType || !submissionUrl) {
      return NextResponse.json(
        { error: 'competitionType and submissionUrl are required' },
        { status: 400 }
      );
    }

    if (!['reels', 'poster', 'essay'].includes(competitionType)) {
      return NextResponse.json(
        { error: 'Invalid competition type' },
        { status: 400 }
      );
    }

    // Upsert submission
    const { data, error } = await supabase
      .from('competition_submissions')
      .upsert(
        {
          email: normalizedEmail,
          competition_type: competitionType,
          submission_url: submissionUrl.trim(),
          submission_title: submissionTitle?.trim() || null,
          notes: notes?.trim() || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'email,competition_type' }
      )
      .select()
      .single();

    if (error) throw error;

    // Invalidate cached submissions for this user
    await invalidateCompetitionSubmissionsCache(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: 'Competition submission saved successfully',
      submission: data,
    });
  } catch (error) {
    console.error('Error saving competition submission:', error);
    return NextResponse.json(
      { error: 'Failed to save competition submission' },
      { status: 500 }
    );
  }
}
