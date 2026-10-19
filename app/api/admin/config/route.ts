import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  cacheAside,
  CACHE_TTL,
  invalidateCache,
  invalidatePlatformConfigCache,
} from '@/lib/redis';

async function countWhere(table: string, filters: Record<string, string | boolean | null>) {
  let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
  for (const [column, value] of Object.entries(filters)) {
    query = value === null ? query.is(column, null) : query.eq(column, value);
  }
  const { count, error } = await query;
  // A missing table (migration not run yet) reads as nothing waiting
  return error ? 0 : count || 0;
}

/**
 * Work waiting on an organizer. Not cached: these change on every review action
 * and the header should reflect them immediately.
 */
async function loadAttention() {
  const [passPending, certPending, certToDeliver, accommodationRequested] = await Promise.all([
    countWhere('festival_pass_claims', { status: 'claimed_provisional' }),
    countWhere('certificate_payment_submissions', { status: 'pending_verification' }),
    countWhere('certificate_payment_submissions', { status: 'verified', delivered_at: null }),
    countWhere('accommodation_requests', { needs_accommodation: true, status: 'requested' }),
  ]);
  return { passPending, certPending, certToDeliver, accommodationRequested };
}

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const payload = await cacheAside(
      'admin:config_and_stats',
      CACHE_TTL.ADMIN_STATS,
      async () => {
        const { data: configs } = await supabaseAdmin.from('platform_config').select('*');
        const { count: userCount } = await supabaseAdmin
          .from('allowed_emails')
          .select('*', { count: 'exact', head: true });
        const { count: teamCount } = await supabaseAdmin
          .from('hackathon_teams')
          .select('*', { count: 'exact', head: true });
        const { count: subCount } = await supabaseAdmin
          .from('competition_submissions')
          .select('*', { count: 'exact', head: true });

        const configMap: Record<string, any> = {};
        (configs || []).forEach((c) => {
          configMap[c.key] = c.value;
        });

        return {
          config: configMap,
          stats: {
            whitelistedUsers: userCount || 0,
            teamsFormed: teamCount || 0,
            competitionSubmissions: subCount || 0,
          },
        };
      }
    );

    return NextResponse.json({ ...payload, attention: await loadAttention() });
  } catch (error) {
    console.error('Error fetching admin config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('platform_config')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    // Invalidate cached config and stats
    await invalidatePlatformConfigCache(key);
    await invalidateCache('admin:config_and_stats');

    return NextResponse.json({
      success: true,
      message: `Updated configuration for ${key}`,
      data,
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
