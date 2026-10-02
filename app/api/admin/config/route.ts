import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  cacheAside,
  CACHE_TTL,
  invalidateCache,
  invalidatePlatformConfigCache,
} from '@/lib/redis';

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
        const { data: configs } = await supabase.from('platform_config').select('*');
        const { count: userCount } = await supabase
          .from('allowed_emails')
          .select('*', { count: 'exact', head: true });
        const { count: teamCount } = await supabase
          .from('hackathon_teams')
          .select('*', { count: 'exact', head: true });
        const { count: subCount } = await supabase
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

    return NextResponse.json(payload);
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

    const { data, error } = await supabase
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
