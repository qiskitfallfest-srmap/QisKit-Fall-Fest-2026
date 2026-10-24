import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getTimedOfflineSessions, isBreak } from '@/data/schedule.utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// A session is due when it starts within the next LEAD_MS. The job runs every 5 minutes,
// so each saved session is picked up once, 5–12 minutes before it starts. GRACE_MS covers
// a late run right at the start time.
const LEAD_MS = 12 * 60_000;
const GRACE_MS = 2 * 60_000;
const CHUNK = 200;
const CONCURRENCY = 20;

interface SubscriptionRow {
  id: string;
  email: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) await worker(items[next++]);
    })
  );
}

/**
 * Sends a Web Push reminder for every saved session that is about to start.
 * Called every 5 minutes by a Supabase pg_cron + pg_net job during 26–30 October.
 * Header: Authorization: Bearer <SCHEDULE_REMINDER_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.SCHEDULE_REMINDER_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'VAPID keys are not configured' }, { status: 500 });
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:qiskitfallfest@srmap.edu.in', publicKey, privateKey);

  const now = Date.now();
  const due = getTimedOfflineSessions().filter(
    (t) => !isBreak(t.session) && t.startMs - now <= LEAD_MS && t.startMs - now > -GRACE_MS
  );
  if (due.length === 0) return NextResponse.json({ success: true, due: 0, sent: 0 });

  try {
    const { data: agendaRows, error: agendaError } = await supabaseAdmin
      .from('schedule_agenda')
      .select('id, email, session_id')
      .in('session_id', due.map((t) => t.session.id))
      .is('reminded_at', null);
    if (agendaError) throw agendaError;
    if (!agendaRows || agendaRows.length === 0) {
      return NextResponse.json({ success: true, due: due.length, sent: 0 });
    }

    // Claim the rows first so an overlapping run cannot send the same reminder twice
    const claimedAt = new Date().toISOString();
    const rowIds = agendaRows.map((r) => r.id);
    for (const ids of chunks(rowIds, CHUNK)) {
      const { error } = await supabaseAdmin
        .from('schedule_agenda')
        .update({ reminded_at: claimedAt })
        .in('id', ids)
        .is('reminded_at', null);
      if (error) throw error;
    }

    const emails = [...new Set(agendaRows.map((r) => r.email))];
    const subsByEmail = new Map<string, SubscriptionRow[]>();
    for (const batch of chunks(emails, CHUNK)) {
      const { data, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('id, email, endpoint, p256dh, auth')
        .in('email', batch);
      if (error) throw error;
      for (const sub of data || []) {
        const list = subsByEmail.get(sub.email) || [];
        list.push(sub);
        subsByEmail.set(sub.email, list);
      }
    }

    const sessionsById = new Map(due.map((t) => [t.session.id, t]));
    const jobs = agendaRows.flatMap((row) => {
      const timed = sessionsById.get(row.session_id)!;
      const minutes = Math.max(0, Math.round((timed.startMs - now) / 60_000));
      const payload = JSON.stringify({
        title: minutes > 0 ? `Starts in ${minutes} min: ${timed.session.title}` : `Starting now: ${timed.session.title}`,
        body: `${timed.session.time} · ${timed.session.location}`,
        url: `/schedule#${timed.session.id}`,
        tag: `session-${timed.session.id}`,
      });
      return (subsByEmail.get(row.email) || []).map((sub) => ({ sub, payload }));
    });

    let sent = 0;
    let expired = 0;
    let failed = 0;
    const sentIds: string[] = [];
    await runPool(jobs, async ({ sub, payload }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 15 * 60, urgency: 'high', timeout: 10_000 }
        );
        sent++;
        sentIds.push(sub.id);
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          expired++;
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          failed++;
          console.error('[Session Reminders] push failed:', err?.statusCode, err?.body || err?.message);
        }
      }
    });

    for (const ids of chunks([...new Set(sentIds)], CHUNK)) {
      await supabaseAdmin.from('push_subscriptions').update({ last_sent_at: claimedAt, failure_count: 0 }).in('id', ids);
    }

    return NextResponse.json({
      success: true,
      due: due.length,
      reminders: agendaRows.length,
      sent,
      expired,
      failed,
    });
  } catch (err: any) {
    console.error('[Session Reminders Error]:', err);
    return NextResponse.json({ error: err?.message || 'Reminder run failed' }, { status: 500 });
  }
}
