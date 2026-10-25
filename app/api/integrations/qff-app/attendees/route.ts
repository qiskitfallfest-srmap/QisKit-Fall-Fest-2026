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
 * Everyone on the whitelist, for the QFF 2026 app's sync (https://app.qffsrmap2026.com), in pages ordered by email.
 * Read-only. Needs `Authorization: Bearer <GCP_ACCESS>`. Phone numbers are never included.
 */
export async function GET(request: NextRequest) {
  if (!keyMatches(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '', 10) || PAGE_MAX, 1), PAGE_MAX);
    const cursor = (searchParams.get('cursor') || '').trim().toLowerCase();

    let query = supabaseAdmin
      .from('allowed_emails')
      .select('email, full_name, role, is_active')
      .order('email', { ascending: true })
      .limit(limit);
    if (cursor) query = query.gt('email', cursor);
    const { data: rows, error } = await query;
    if (error) throw error;

    const emails = (rows || []).map((r) => String(r.email).toLowerCase());
    const regs = emails.length
      ? await supabaseAdmin.from('registrations').select('email, institution').in('email', emails)
      : { data: [], error: null };
    if (regs.error) throw regs.error;

    const institution = new Map<string, string>();
    for (const r of regs.data || []) {
      const key = String(r.email).toLowerCase();
      if (r.institution && !institution.has(key)) institution.set(key, r.institution);
    }

    const people = (rows || []).map((r) => {
      const email = String(r.email).toLowerCase();
      return {
        email,
        name: r.full_name || '',
        institution: institution.get(email) || null,
        role: r.role,
        isActive: r.is_active !== false,
      };
    });

    return NextResponse.json(
      { people, nextCursor: people.length === limit ? people[people.length - 1].email : null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    await logError('integrations.qff_app.export_failed', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
