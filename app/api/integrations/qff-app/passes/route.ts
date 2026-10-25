import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const PAGE_MAX = 500;

function keyMatches(header: string | null): boolean {
  const expected = process.env.GCP_ACCESS;
  const given = /^Bearer (.+)$/.exec(header || '')?.[1];
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * GET ?cursor=<last email>&limit=500
 * Everyone who holds a VERIFIED festival pass (General Offline ₹99 or Flagship ₹499), one row per email, for the QFF 2026 app's sync.
 * `tier` is "flagship" if any verified Flagship claim exists, otherwise "general". Read-only. Needs `Authorization: Bearer <GCP_ACCESS>`.
 * Phone numbers, receipts and transaction ids are never included.
 */
export async function GET(request: NextRequest) {
  if (!keyMatches(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '', 10) || PAGE_MAX, 1), PAGE_MAX);
    const cursor = (searchParams.get('cursor') || '').trim().toLowerCase();

    // ?summary=1: how many claims there are by tier, status and paid/free (no names, no emails): for checking the numbers
    if (searchParams.get('summary') === '1') {
      const counts = new Map<string, number>();
      for (let from = 0; from < 20000; from += 1000) {
        const { data, error: e } = await supabaseAdmin.from('festival_pass_claims').select('pass_tier, status, amount_inr, user_email').range(from, from + 999);
        if (e) throw e;
        for (const r of data || []) {
          const srm = String(r.user_email).toLowerCase().endsWith('@srmap.edu.in') ? 'srm' : 'outside';
          const key = [r.pass_tier, r.status, Number(r.amount_inr) > 0 ? 'paid' : 'free', srm].join('|');
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        if (!data || data.length < 1000) break;
      }
      return NextResponse.json(
        { claims: [...counts.entries()].map(([k, n]) => { const [tier, status, amount, who] = k.split('|'); return { tier, status, amount, who, count: n }; }) },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // lower-cased emails are what the app matches on; claims store whatever case the user signed in with, so order and page on the raw column
    let query = supabaseAdmin
      .from('festival_pass_claims')
      .select('user_email, user_name, pass_tier')
      .eq('status', 'verified')
      .order('user_email', { ascending: true })
      .limit(limit);
    if (cursor) query = query.gt('user_email', cursor);
    const { data: rows, error } = await query;
    if (error) throw error;

    let page = rows || [];
    let nextCursor: string | null = null;
    if (page.length === limit) {
      // the last email may continue on the next page: hold its rows back so one person is never split across pages
      const last = page[page.length - 1].user_email;
      const kept = page.filter((r) => r.user_email !== last);
      nextCursor = kept.length ? kept[kept.length - 1].user_email : last;
      page = kept.length ? kept : page;
    }

    const byEmail = new Map<string, { email: string; name: string; tier: 'general' | 'flagship' }>();
    for (const r of page) {
      const email = String(r.user_email).trim().toLowerCase();
      const tier = r.pass_tier === 'flagship_offline' ? 'flagship' : 'general';
      const cur = byEmail.get(email);
      if (!cur) byEmail.set(email, { email, name: r.user_name || '', tier });
      else if (tier === 'flagship') cur.tier = 'flagship';
    }

    return NextResponse.json(
      { people: [...byEmail.values()], nextCursor: nextCursor ? nextCursor.toLowerCase() : null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    await logError('integrations.qff_app.passes_export_failed', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
