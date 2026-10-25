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

    // ?audit=1: integrity checks on the outside-SRM pass-holders (who paid): amount vs tier, reused bank references, missing reviewer, name mismatches
    if (searchParams.get('audit') === '1') {
      type C = { user_email: string; user_name: string; pass_tier: string; status: string; amount_inr: number; transaction_reference: string; bank_reference: string | null; reviewed_by: string | null };
      const all: C[] = [];
      for (let from = 0; from < 20000; from += 1000) {
        const { data, error: e } = await supabaseAdmin.from('festival_pass_claims').select('user_email, user_name, pass_tier, status, amount_inr, transaction_reference, bank_reference, reviewed_by').range(from, from + 999);
        if (e) throw e;
        all.push(...((data as C[]) || []));
        if (!data || data.length < 1000) break;
      }
      const verified = all.filter((c) => c.status === 'verified' && !String(c.user_email).toLowerCase().endsWith('@srmap.edu.in'));
      const emails = verified.map((c) => String(c.user_email).toLowerCase());
      const names = new Map<string, string>();
      for (let i = 0; i < emails.length; i += 200) {
        const { data } = await supabaseAdmin.from('allowed_emails').select('email, full_name').in('email', emails.slice(i, i + 200));
        for (const r of data || []) names.set(String(r.email).toLowerCase(), r.full_name || '');
      }
      const token = (x: string) => x.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);
      const bankCount = new Map<string, number>();
      for (const c of all) if (c.bank_reference) bankCount.set(c.bank_reference.trim().toLowerCase(), (bankCount.get(c.bank_reference.trim().toLowerCase()) || 0) + 1);
      const flagged: { email: string; tier: string; amount: number; flags: string[] }[] = [];
      for (const c of verified) {
        const flags: string[] = []; const amt = Number(c.amount_inr);
        if (c.pass_tier === 'flagship_offline' && amt !== 499) flags.push('flagship amount is not 499');
        if (c.pass_tier === 'general_offline' && amt !== 99) flags.push(amt === 0 ? 'free pass on an outside email' : 'general amount is not 99');
        if (!c.reviewed_by) flags.push('no reviewer recorded');
        if (c.bank_reference && (bankCount.get(c.bank_reference.trim().toLowerCase()) || 0) > 1) flags.push('bank reference used on more than one claim');
        const reg = names.get(String(c.user_email).toLowerCase());
        if (reg && token(reg).length && token(c.user_name).length && !token(reg).some((w) => token(c.user_name).includes(w))) flags.push('claim name differs from profile name');
        if (flags.length) flagged.push({ email: String(c.user_email).toLowerCase(), tier: c.pass_tier, amount: amt, flags });
      }
      return NextResponse.json(
        { outsideVerified: verified.length, flaggedCount: flagged.length, flagged: flagged.slice(0, 80) },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

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
      .select('user_email, user_name, pass_tier, status')
      .in('status', ['verified', 'claimed_provisional', 'rejected'])
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

    // one row per email: "verified" beats "pending" beats "rejected" (someone with a verified pass is a pass-holder whatever else they filed)
    const RANK: Record<string, number> = { verified: 3, pending: 2, rejected: 1 };
    const byEmail = new Map<string, { email: string; name: string; tier: 'general' | 'flagship'; status: 'verified' | 'pending' | 'rejected' }>();
    for (const r of page) {
      const email = String(r.user_email).trim().toLowerCase();
      const tier = r.pass_tier === 'flagship_offline' ? 'flagship' : 'general';
      const status = r.status === 'verified' ? 'verified' : r.status === 'claimed_provisional' ? 'pending' : 'rejected';
      const cur = byEmail.get(email);
      if (!cur) byEmail.set(email, { email, name: r.user_name || '', tier, status });
      else {
        if (RANK[status] > RANK[cur.status]) { cur.status = status; cur.tier = tier; }
        else if (status === cur.status && tier === 'flagship') cur.tier = 'flagship';
      }
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
