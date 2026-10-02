import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  getPlatformConfigCached,
  getUserProgressCached,
  invalidateUserProgressCache,
} from '@/lib/redis';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { SESSION_QUIZZES } from '@/data/learning/quizzes';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Check if global lock override is active (Cache-Aside with 1-hr TTL)
    const overrideValue = await getPlatformConfigCached<{ enabled?: boolean } | null>(
      'lecture_lock_override',
      async () => {
        const { data } = await supabase
          .from('platform_config')
          .select('value')
          .eq('key', 'lecture_lock_override')
          .maybeSingle();
        return data?.value ?? null;
      }
    );

    const isLockOverridden = overrideValue?.enabled === true;

    // 2. Fetch user progress records (Cache-Aside with 10-min TTL)
    const records = await getUserProgressCached<any[]>(
      session.email,
      async () => {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .ilike('email', session.email);

        if (error) throw error;
        return data || [];
      }
    );

    const progressMap = new Map(
      (records || []).map((r: any) => [r.session_id, r])
    );

    // 3. Compute locked/unlocked state sequentially
    const computedProgress: Record<
      string,
      {
        unlocked: boolean;
        videoCompleted: boolean;
        quizPassed: boolean;
        quizScore: number;
        completedAt: string | null;
      }
    > = {};

    let previousSessionCompleted = true; // Session 1 starts unlocked

    for (let i = 0; i < CURRICULUM_SESSIONS.length; i++) {
      const sess = CURRICULUM_SESSIONS[i];
      const record = progressMap.get(sess.id);
      const isVideoDone = record?.video_completed || false;
      const isQuizPassed = record?.quiz_passed || false;
      const isDone = isVideoDone && isQuizPassed;

      const isUnlocked = isLockOverridden || previousSessionCompleted;

      computedProgress[sess.id] = {
        unlocked: isUnlocked,
        videoCompleted: isVideoDone,
        quizPassed: isQuizPassed,
        quizScore: record?.quiz_score || 0,
        completedAt: record?.completed_at || null,
      };

      // In non-override mode, next session only unlocks if this one was finished
      previousSessionCompleted = isDone;
    }

    return NextResponse.json({
      email: session.email,
      isLockOverridden,
      progress: computedProgress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, action, userAnswers } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (action === 'mark_video') {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            email: session.email,
            session_id: sessionId,
            video_completed: true,
          },
          { onConflict: 'email,session_id' }
        )
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache-aside progress cache
      await invalidateUserProgressCache(session.email);

      return NextResponse.json({ success: true, data });
    }

    if (action === 'submit_quiz') {
      const quiz = SESSION_QUIZZES[sessionId];
      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }

      // Grade the quiz
      let correctCount = 0;
      const questionResults: Record<string, boolean> = {};

      quiz.questions.forEach((q, idx) => {
        const selected = userAnswers?.[q.id];
        const isCorrect = selected === q.correctIndex;
        if (isCorrect) correctCount++;
        questionResults[q.id] = isCorrect;
      });

      const scorePercent = Math.round(
        (correctCount / quiz.questions.length) * 100
      );
      const passed = scorePercent >= quiz.passingScore;

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            email: session.email,
            session_id: sessionId,
            quiz_score: scorePercent,
            quiz_passed: passed,
            completed_at: passed ? new Date().toISOString() : null,
          },
          { onConflict: 'email,session_id' }
        )
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache-aside progress cache
      await invalidateUserProgressCache(session.email);

      return NextResponse.json({
        success: true,
        scorePercent,
        passed,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions: quiz.questions.length,
        questionResults,
        data,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
