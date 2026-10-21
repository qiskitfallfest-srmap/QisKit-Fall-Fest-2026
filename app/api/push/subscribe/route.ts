import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Push services the browsers we support hand out; anything else is rejected so the
// sender never posts to an arbitrary URL.
const ALLOWED_PUSH_HOSTS = [
  /(^|\.)fcm\.googleapis\.com$/,
  /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)push\.apple\.com$/,
  /(^|\.)notify\.windows\.com$/,
];

function parseSubscription(raw: any): { endpoint: string; p256dh: string; auth: string } | null {
  const endpoint = typeof raw?.endpoint === 'string' ? raw.endpoint : '';
  const p256dh = typeof raw?.keys?.p256dh === 'string' ? raw.keys.p256dh : '';
  const auth = typeof raw?.keys?.auth === 'string' ? raw.keys.auth : '';
  if (!endpoint || endpoint.length > 1000 || !p256dh || p256dh.length > 200 || !auth || auth.length > 100) return null;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || !ALLOWED_PUSH_HOSTS.some((re) => re.test(url.hostname))) return null;
  } catch {
    return null;
  }
  return { endpoint, p256dh, auth };
}

/**
 * POST { subscription: PushSubscriptionJSON, replaces?: string }
 * Saves this browser's push subscription for the signed-in participant. `replaces`
 * is the old endpoint when the service worker re-subscribes after a rotation.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    const sub = parseSubscription(body?.subscription);
    if (!sub) return NextResponse.json({ error: 'This browser sent an invalid subscription.' }, { status: 400 });

    const nowIso = new Date().toISOString();
    const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
      {
        email,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        user_agent: (request.headers.get('user-agent') || '').slice(0, 300),
        updated_at: nowIso,
        failure_count: 0,
      },
      { onConflict: 'endpoint' }
    );
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return NextResponse.json({ error: 'Notifications are not open yet. Try again later.' }, { status: 503 });
      }
      throw error;
    }

    if (typeof body?.replaces === 'string' && body.replaces !== sub.endpoint) {
      await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', body.replaces).eq('email', email);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Push Subscribe POST Error]:', err);
    return NextResponse.json({ error: 'Could not turn on notifications.' }, { status: 500 });
  }
}

/** DELETE { endpoint } removes this browser's subscription for the signed-in participant. */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';
    if (!endpoint) return NextResponse.json({ error: 'Missing endpoint.' }, { status: 400 });

    const { error } = await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('email', email);
    if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Push Subscribe DELETE Error]:', err);
    return NextResponse.json({ error: 'Could not turn off notifications.' }, { status: 500 });
  }
}
