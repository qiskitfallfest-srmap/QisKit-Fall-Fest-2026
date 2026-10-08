import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { QISKIT_CHALLENGES } from '@/data/qiskit/challenges';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
    }

    // 1. Fetch all submissions
    const { data: submissions, error: subErr } = await supabaseAdmin
      .from('coding_submissions')
      .select('id, user_email, challenge_id, status, score, max_score, passed_tests, total_tests, execution_time_ms, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(100);

    if (subErr) {
      return NextResponse.json({ success: false, error: subErr.message }, { status: 500 });
    }

    // 2. Compute problem-wise statistics
    const problemStats = QISKIT_CHALLENGES.map((ch) => {
      const problemSubs = (submissions || []).filter((s) => s.challenge_id === ch.id);
      const totalCount = problemSubs.length;
      const solvedSubs = problemSubs.filter((s) => (s.score || 0) >= ch.points);
      const uniqueParticipants = new Set(problemSubs.map((s) => s.user_email)).size;
      const uniqueSolvers = new Set(solvedSubs.map((s) => s.user_email)).size;

      return {
        id: ch.id,
        problemCode: ch.problemCode,
        title: ch.title,
        points: ch.points,
        totalSubmissions: totalCount,
        uniqueParticipants,
        uniqueSolvers,
        solveRate: uniqueParticipants > 0 ? Math.round((uniqueSolvers / uniqueParticipants) * 100) : 0,
      };
    });

    const uniqueAllParticipants = new Set((submissions || []).map((s) => s.user_email)).size;

    return NextResponse.json({
      success: true,
      stats: {
        totalSubmissions: (submissions || []).length,
        uniqueParticipants: uniqueAllParticipants,
        problems: problemStats,
      },
      recentSubmissions: submissions || [],
    });
  } catch (err: any) {
    console.error('[API /api/admin/coding-challenge] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
