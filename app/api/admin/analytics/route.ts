import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import {
  getAnalyticsSummary,
  invalidateAnalyticsCache,
  recordAnalyticsEvent,
} from '@/lib/analytics-server';

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      analytics: summary,
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'purge-cache';

    if (action === 'purge-cache') {
      await invalidateAnalyticsCache();
      const freshSummary = await getAnalyticsSummary();
      return NextResponse.json({
        success: true,
        message: 'Analytics cache purged and refreshed successfully.',
        analytics: freshSummary,
      });
    }

    if (action === 'seed-test-view') {
      await recordAnalyticsEvent({
        event: 'page_view',
        path: '/learning/admin',
        userAgent: request.headers.get('user-agent') || 'admin-test',
      });
      await invalidateAnalyticsCache();
      const freshSummary = await getAnalyticsSummary();
      return NextResponse.json({
        success: true,
        message: 'Sample test view recorded.',
        analytics: freshSummary,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing admin analytics action:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process analytics action' },
      { status: 500 }
    );
  }
}
