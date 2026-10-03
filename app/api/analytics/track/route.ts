import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/lib/analytics-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, path, properties, visitorId, timestamp } = body || {};

    if (!event) {
      return NextResponse.json({ error: 'event is required' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;

    // Record non-blocking
    await recordAnalyticsEvent({
      event,
      path: path || '/',
      properties,
      visitorId,
      userAgent,
      ip,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Analytics ingestion should fail open and never crash clients
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to record event' },
      { status: 200 }
    );
  }
}
