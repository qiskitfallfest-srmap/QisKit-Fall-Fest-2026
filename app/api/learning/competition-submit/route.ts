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

    const trimmedUrl = String(submissionUrl).trim();

    if (/^file:\/\//i.test(trimmedUrl) || /^[a-zA-Z]:\\/.test(trimmedUrl)) {
      return NextResponse.json(
        {
          error:
            'Local computer file paths (file://) cannot be accessed by the jury. Please use the "Upload Document (.pdf / .docx)" option or provide a public web URL.',
        },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Please provide a valid URL starting with https:// or upload a .pdf / .docx document.' },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return NextResponse.json(
        {
          error:
            'Only valid http:// or https:// links or uploaded documents (.pdf / .docx) are accepted.',
        },
        { status: 400 }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json(
        { error: 'Localhost links cannot be accessed by the evaluation panel.' },
        { status: 400 }
      );
    }

    if (
      hostname === 'qffsrmap2026.com' ||
      hostname === 'www.qffsrmap2026.com' ||
      hostname === 'qis-kit-fall-fest-2026.vercel.app'
    ) {
      return NextResponse.json(
        {
          error:
            'Please submit your own competition entry link or uploaded document, not the festival website URL.',
        },
        { status: 400 }
      );
    }

    if (
      hostname.includes('googleusercontent.com') &&
      parsedUrl.pathname.includes('/export/')
    ) {
      return NextResponse.json(
        {
          error:
            'Temporary Google Docs export download links expire quickly and cannot be opened by judges. Please upload your .pdf or .docx file directly using the "Upload Document" tab, or paste a standard Google Docs share link (https://docs.google.com/...).',
        },
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
          submission_url: trimmedUrl,
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
