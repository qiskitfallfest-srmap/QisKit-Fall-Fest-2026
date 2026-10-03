import { redis, cacheAside, CACHE_TTL, invalidateCache } from './redis';
import { supabase } from './supabase';

export interface AnalyticsEventPayload {
  event: string;
  path?: string;
  properties?: Record<string, any>;
  visitorId?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
}

export interface DayTrafficStats {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon", "Oct 01"
  views: number;
  visitors: number;
}

export interface TopPageStats {
  path: string;
  views: number;
  percentage: number;
}

export interface AnalyticsSummary {
  vercelAnalyticsEnabled: boolean;
  redisCacheActive: boolean;
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  history7Days: DayTrafficStats[];
  topPages: TopPageStats[];
  eventCounts: Record<string, number>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
    other: number;
  };
  recentEvents: Array<{
    event: string;
    path: string;
    device: string;
    timestamp: string;
    properties?: Record<string, any>;
  }>;
  platformConversions: {
    whitelistedUsers: number;
    teamsFormed: number;
    competitionSubmissions: number;
    certificatesIssued: number;
  };
  generatedAt: string;
}

// In-memory fallback store for development or environments without Upstash Redis
const memoryStore: {
  totalViews: number;
  totalVisitors: number;
  todayViews: number;
  todayVisitors: number;
  topPages: Record<string, number>;
  events: Record<string, number>;
  devices: Record<string, number>;
  recentEvents: Array<{
    event: string;
    path: string;
    device: string;
    timestamp: string;
    properties?: Record<string, any>;
  }>;
} = {
  totalViews: 0,
  totalVisitors: 0,
  todayViews: 0,
  todayVisitors: 0,
  topPages: {},
  events: {},
  devices: {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    other: 0,
  },
  recentEvents: [],
};

function parseDeviceType(userAgent?: string): 'desktop' | 'mobile' | 'tablet' | 'other' {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return 'tablet';
  }
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function normalizePath(rawPath?: string): string {
  if (!rawPath) return '/';
  try {
    const url = new URL(rawPath, 'http://localhost');
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return pathname || '/';
  } catch {
    return rawPath.split('?')[0] || '/';
  }
}

/**
 * Record an analytics event or pageview into Upstash Redis with pipeline caching.
 */
export async function recordAnalyticsEvent(payload: AnalyticsEventPayload): Promise<void> {
  const { event, properties, visitorId, userAgent, ip } = payload;
  const path = normalizePath(payload.path);
  const now = new Date();
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const device = parseDeviceType(userAgent);
  const effectiveVisitorId = visitorId || ip || 'anon_' + Math.random().toString(36).slice(2, 8);

  // Update in-memory fallback
  memoryStore.recentEvents.unshift({
    event,
    path,
    device,
    timestamp: payload.timestamp || now.toISOString(),
    properties,
  });
  if (memoryStore.recentEvents.length > 50) {
    memoryStore.recentEvents.pop();
  }

  if (event === 'page_view') {
    memoryStore.totalViews++;
    memoryStore.todayViews++;
    memoryStore.topPages[path] = (memoryStore.topPages[path] || 0) + 1;
    memoryStore.devices[device] = (memoryStore.devices[device] || 0) + 1;
  } else {
    memoryStore.events[event] = (memoryStore.events[event] || 0) + 1;
  }

  // Update Redis if connected
  if (redis) {
    try {
      const pipeline = redis.pipeline();

      if (event === 'page_view') {
        // Increment page views
        pipeline.incr('analytics:pageviews:total');
        pipeline.incr(`analytics:pageviews:daily:${today}`);
        pipeline.expire(`analytics:pageviews:daily:${today}`, 60 * 86400);

        // HyperLogLog for unique visitors
        pipeline.pfadd('analytics:visitors:total', effectiveVisitorId);
        pipeline.pfadd(`analytics:visitors:daily:${today}`, effectiveVisitorId);
        pipeline.expire(`analytics:visitors:daily:${today}`, 60 * 86400);

        // Top pages sorted set
        pipeline.zincrby('analytics:top_pages', 1, path);

        // Device breakdown
        pipeline.hincrby('analytics:devices', device, 1);
      } else {
        // Event counter
        pipeline.hincrby('analytics:events', event, 1);
      }

      // Recent event log (ring buffer)
      const eventRecord = JSON.stringify({
        event,
        path,
        device,
        timestamp: payload.timestamp || now.toISOString(),
        properties,
      });
      pipeline.lpush('analytics:recent_events', eventRecord);
      pipeline.ltrim('analytics:recent_events', 0, 49);

      await pipeline.exec();
    } catch (err) {
      console.warn('[Analytics Server] Redis ingestion error:', err);
    }
  }
}

/**
 * Retrieve full cached analytics summary for the Admin Console.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const cacheKey = 'admin:analytics_summary';

  return cacheAside(cacheKey, CACHE_TTL.ADMIN_STATS, async () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Fetch database conversions from Supabase (100% genuine database counts)
    let whitelistedUsers = 0;
    let teamsFormed = 0;
    let competitionSubmissions = 0;
    let certificatesIssued = 0;

    try {
      const [userRes, teamRes, compRes, certRes] = await Promise.all([
        supabase.from('allowed_emails').select('*', { count: 'exact', head: true }),
        supabase.from('hackathon_teams').select('*', { count: 'exact', head: true }),
        supabase.from('competition_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('issued_certificates').select('*', { count: 'exact', head: true }),
      ]);
      whitelistedUsers = userRes.count || 0;
      teamsFormed = teamRes.count || 0;
      competitionSubmissions = compRes.count || 0;
      certificatesIssued = certRes.count || 0;
    } catch (dbErr) {
      console.warn('[Analytics Server] Supabase stats count warning:', dbErr);
    }

    if (!redis) {
      // Build 7-day fallback history (Strict zero baseline)
      const history7Days: DayTrafficStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const isToday = i === 0;
        history7Days.push({
          date: dateStr,
          dayLabel,
          views: isToday ? memoryStore.todayViews : 0,
          visitors: isToday ? memoryStore.todayVisitors : 0,
        });
      }

      const totalPageViews = memoryStore.totalViews;
      const topPagesArray: TopPageStats[] = Object.entries(memoryStore.topPages)
        .map(([path, views]) => ({
          path,
          views,
          percentage: totalPageViews > 0 ? Math.round((views / totalPageViews) * 100) : 0,
        }))
        .sort((a, b) => b.views - a.views);

      return {
        vercelAnalyticsEnabled: true,
        redisCacheActive: false,
        totalPageViews: memoryStore.totalViews,
        totalUniqueVisitors: memoryStore.totalVisitors,
        todayPageViews: memoryStore.todayViews,
        todayUniqueVisitors: memoryStore.todayVisitors,
        history7Days,
        topPages: topPagesArray,
        eventCounts: memoryStore.events,
        deviceBreakdown: memoryStore.devices as any,
        recentEvents: memoryStore.recentEvents.slice(0, 20),
        platformConversions: {
          whitelistedUsers,
          teamsFormed,
          competitionSubmissions,
          certificatesIssued,
        },
        generatedAt: now.toISOString(),
      };
    }

    try {
      // 1. Fetch total & today metrics
      const [rawTotalViews, rawTotalVisitors, rawTodayViews, rawTodayVisitors] = await Promise.all([
        redis.get<number>('analytics:pageviews:total'),
        redis.pfcount('analytics:visitors:total'),
        redis.get<number>(`analytics:pageviews:daily:${today}`),
        redis.pfcount(`analytics:visitors:daily:${today}`),
      ]);

      const totalPageViews = rawTotalViews !== null && rawTotalViews !== undefined ? Number(rawTotalViews) : memoryStore.totalViews;
      const totalUniqueVisitors = rawTotalVisitors !== null && rawTotalVisitors !== undefined ? Number(rawTotalVisitors) : memoryStore.totalVisitors;
      const todayPageViews = rawTodayViews !== null && rawTodayViews !== undefined ? Number(rawTodayViews) : memoryStore.todayViews;
      const todayUniqueVisitors = rawTodayVisitors !== null && rawTodayVisitors !== undefined ? Number(rawTodayVisitors) : memoryStore.todayVisitors;

      // 2. Build 7-day trend
      const pastDaysPromises = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        pastDaysPromises.push(
          Promise.all([
            redis.get<number>(`analytics:pageviews:daily:${dateStr}`),
            redis.pfcount(`analytics:visitors:daily:${dateStr}`),
          ]).then(([views, visitors]) => ({
            date: dateStr,
            dayLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            views: views !== null && views !== undefined ? Number(views) : (i === 0 ? todayPageViews : 0),
            visitors: visitors !== null && visitors !== undefined ? Number(visitors) : (i === 0 ? todayUniqueVisitors : 0),
          }))
        );
      }
      const history7Days = await Promise.all(pastDaysPromises);

      // 3. Top Pages
      let topPagesArray: TopPageStats[] = [];
      try {
        const rawTop = await redis.zrange<string[]>('analytics:top_pages', 0, 9, {
          rev: true,
          withScores: true,
        });

        if (Array.isArray(rawTop) && rawTop.length > 0) {
          for (let i = 0; i < rawTop.length; i += 2) {
            const path = typeof rawTop[i] === 'string' ? rawTop[i] : (rawTop[i] as any)?.member;
            const views = typeof rawTop[i + 1] === 'number' ? rawTop[i + 1] : Number((rawTop[i] as any)?.score || 0);
            if (path) {
              topPagesArray.push({
                path,
                views: Number(views) || 0,
                percentage: totalPageViews > 0 ? Math.round(((Number(views) || 0) / totalPageViews) * 100) : 0,
              });
            }
          }
        }
      } catch (zerr) {
        console.warn('[Analytics Server] Top pages read warning:', zerr);
      }

      if (topPagesArray.length === 0) {
        topPagesArray = Object.entries(memoryStore.topPages).map(([path, views]) => ({
          path,
          views,
          percentage: totalPageViews > 0 ? Math.round((views / totalPageViews) * 100) : 0,
        }));
      }

      // 4. Events & Devices
      const [rawEvents, rawDevices, rawRecent] = await Promise.all([
        redis.hgetall<Record<string, number>>('analytics:events'),
        redis.hgetall<Record<string, number>>('analytics:devices'),
        redis.lrange<string>('analytics:recent_events', 0, 19),
      ]);

      const eventCounts = rawEvents || memoryStore.events;
      const deviceBreakdown = {
        desktop: Number(rawDevices?.desktop) || memoryStore.devices.desktop,
        mobile: Number(rawDevices?.mobile) || memoryStore.devices.mobile,
        tablet: Number(rawDevices?.tablet) || memoryStore.devices.tablet,
        other: Number(rawDevices?.other) || 0,
      };

      const parsedRecent = (rawRecent || []).map((item) => {
        try {
          return typeof item === 'string' ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      }).filter(Boolean);

      return {
        vercelAnalyticsEnabled: true,
        redisCacheActive: true,
        totalPageViews,
        totalUniqueVisitors,
        todayPageViews,
        todayUniqueVisitors,
        history7Days,
        topPages: topPagesArray,
        eventCounts,
        deviceBreakdown,
        recentEvents: parsedRecent.length > 0 ? parsedRecent : memoryStore.recentEvents,
        platformConversions: {
          whitelistedUsers,
          teamsFormed,
          competitionSubmissions,
          certificatesIssued,
        },
        generatedAt: now.toISOString(),
      };
    } catch (redisErr) {
      console.error('[Analytics Server] Error querying Redis summary:', redisErr);
      return {
        vercelAnalyticsEnabled: true,
        redisCacheActive: false,
        totalPageViews: memoryStore.totalViews,
        totalUniqueVisitors: memoryStore.totalVisitors,
        todayPageViews: memoryStore.todayViews,
        todayUniqueVisitors: memoryStore.todayVisitors,
        history7Days: [],
        topPages: [],
        eventCounts: memoryStore.events,
        deviceBreakdown: memoryStore.devices as any,
        recentEvents: memoryStore.recentEvents,
        platformConversions: {
          whitelistedUsers,
          teamsFormed,
          competitionSubmissions,
          certificatesIssued,
        },
        generatedAt: now.toISOString(),
      };
    }
  });
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await invalidateCache('admin:analytics_summary');
}
