import { redis, cacheAside, CACHE_TTL, invalidateCache } from './redis';
import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';

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

interface StoredAnalyticsData {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  lastDate: string;
  topPages: Record<string, number>;
  events: Record<string, number>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
    other: number;
  };
  dailyHistory: Record<string, { views: number; visitors: number }>;
  uniqueVisitors: string[];
  dailyVisitors: Record<string, string[]>;
  recentEvents: Array<{
    event: string;
    path: string;
    device: string;
    timestamp: string;
    properties?: Record<string, any>;
  }>;
}

const DEFAULT_METRICS: StoredAnalyticsData = {
  totalPageViews: 0,
  totalUniqueVisitors: 0,
  todayPageViews: 0,
  todayUniqueVisitors: 0,
  lastDate: new Date().toISOString().slice(0, 10),
  topPages: {},
  events: {},
  devices: {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    other: 0,
  },
  dailyHistory: {},
  uniqueVisitors: [],
  dailyVisitors: {},
  recentEvents: [],
};

// In-memory local fallback in case database query fails
let localMemoryStore: StoredAnalyticsData = { ...DEFAULT_METRICS };

function getDbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseAdmin;
  }
  return supabase;
}

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
 * Fetch persistent stored analytics from Supabase platform_config table.
 */
async function fetchPersistentMetrics(): Promise<StoredAnalyticsData> {
  try {
    const db = getDbClient();
    const { data, error } = await db
      .from('platform_config')
      .select('value')
      .eq('key', 'analytics_metrics')
      .maybeSingle();

    if (error || !data || !data.value) {
      return localMemoryStore;
    }

    const val = data.value as any;
    return {
      totalPageViews: Number(val.totalPageViews) || 0,
      totalUniqueVisitors: Number(val.totalUniqueVisitors) || 0,
      todayPageViews: Number(val.todayPageViews) || 0,
      todayUniqueVisitors: Number(val.todayUniqueVisitors) || 0,
      lastDate: val.lastDate || new Date().toISOString().slice(0, 10),
      topPages: val.topPages || {},
      events: val.events || {},
      devices: val.devices || { desktop: 0, mobile: 0, tablet: 0, other: 0 },
      dailyHistory: val.dailyHistory || {},
      uniqueVisitors: Array.isArray(val.uniqueVisitors) ? val.uniqueVisitors : [],
      dailyVisitors: val.dailyVisitors || {},
      recentEvents: Array.isArray(val.recentEvents) ? val.recentEvents : [],
    };
  } catch (err) {
    console.warn('[Analytics Server] Error reading persistent metrics:', err);
    return localMemoryStore;
  }
}

/**
 * Save persistent metrics to Supabase platform_config.
 */
async function savePersistentMetrics(metrics: StoredAnalyticsData): Promise<void> {
  localMemoryStore = metrics;
  try {
    const db = getDbClient();
    await db.from('platform_config').upsert({
      key: 'analytics_metrics',
      value: metrics,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Analytics Server] Error saving persistent metrics:', err);
  }
}

/**
 * Record an analytics event or pageview persistently into Supabase and Redis.
 */
export async function recordAnalyticsEvent(payload: AnalyticsEventPayload): Promise<void> {
  const { event, properties, userAgent, ip } = payload;
  const path = normalizePath(payload.path);
  const now = new Date();
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const device = parseDeviceType(userAgent);
  const effectiveVisitorId =
    payload.visitorId || (ip ? 'ip_' + ip.replace(/[^a-zA-Z0-9]/g, '') : 'v_' + Math.random().toString(36).slice(2, 9));

  // 1. Fetch current persistent metrics
  const current = await fetchPersistentMetrics();

  // Reset daily counters on new date
  if (current.lastDate !== today) {
    current.todayPageViews = 0;
    current.todayUniqueVisitors = 0;
    current.lastDate = today;
  }

  // Ensure maps exist
  current.topPages = current.topPages || {};
  current.events = current.events || {};
  current.devices = current.devices || { desktop: 0, mobile: 0, tablet: 0, other: 0 };
  current.dailyHistory = current.dailyHistory || {};
  current.dailyVisitors = current.dailyVisitors || {};
  current.uniqueVisitors = current.uniqueVisitors || [];
  current.recentEvents = current.recentEvents || [];

  if (event === 'page_view') {
    current.totalPageViews++;
    current.todayPageViews++;
    current.topPages[path] = (current.topPages[path] || 0) + 1;
    current.devices[device] = (current.devices[device] || 0) + 1;

    // Unique daily visitor check
    current.dailyVisitors[today] = current.dailyVisitors[today] || [];
    if (!current.dailyVisitors[today].includes(effectiveVisitorId)) {
      current.dailyVisitors[today].push(effectiveVisitorId);
      if (current.dailyVisitors[today].length > 1000) {
        current.dailyVisitors[today] = current.dailyVisitors[today].slice(-1000);
      }
      current.todayUniqueVisitors++;
    }

    // All-time unique visitor check
    if (!current.uniqueVisitors.includes(effectiveVisitorId)) {
      current.uniqueVisitors.push(effectiveVisitorId);
      if (current.uniqueVisitors.length > 5000) {
        current.uniqueVisitors = current.uniqueVisitors.slice(-5000);
      }
      current.totalUniqueVisitors++;
    }

    current.dailyHistory[today] = {
      views: current.todayPageViews,
      visitors: current.todayUniqueVisitors,
    };
  } else {
    // Custom interaction event (e.g. unstop_registration_click)
    current.events[event] = (current.events[event] || 0) + 1;
  }

  // Add to recent events stream
  current.recentEvents.unshift({
    event,
    path,
    device,
    timestamp: payload.timestamp || now.toISOString(),
    properties,
  });
  if (current.recentEvents.length > 50) {
    current.recentEvents = current.recentEvents.slice(0, 50);
  }

  // 2. Persist to Supabase Database
  await savePersistentMetrics(current);

  // 3. Increment Redis pipeline if available
  if (redis) {
    try {
      const pipeline = redis.pipeline();
      if (event === 'page_view') {
        pipeline.incr('analytics:pageviews:total');
        pipeline.incr(`analytics:pageviews:daily:${today}`);
        pipeline.pfadd('analytics:visitors:total', effectiveVisitorId);
        pipeline.pfadd(`analytics:visitors:daily:${today}`, effectiveVisitorId);
        pipeline.zincrby('analytics:top_pages', 1, path);
        pipeline.hincrby('analytics:devices', device, 1);
      } else {
        pipeline.hincrby('analytics:events', event, 1);
      }
      await pipeline.exec();
      await invalidateCache('admin:analytics_summary');
    } catch (redisErr) {
      console.warn('[Analytics Server] Redis ingestion warning:', redisErr);
    }
  }
}

/**
 * Retrieve full persistent analytics summary for the Admin Console.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const cacheKey = 'admin:analytics_summary';

  // 15 seconds TTL cache so admin page updates quickly while avoiding excessive DB traffic
  return cacheAside(cacheKey, 15, async () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Fetch database conversions from Supabase (100% genuine database counts)
    let whitelistedUsers = 0;
    let teamsFormed = 0;
    let competitionSubmissions = 0;
    let certificatesIssued = 0;

    try {
      const db = getDbClient();
      const [userRes, teamRes, compRes, certRes] = await Promise.all([
        db.from('allowed_emails').select('*', { count: 'exact', head: true }),
        db.from('hackathon_teams').select('*', { count: 'exact', head: true }),
        db.from('competition_submissions').select('*', { count: 'exact', head: true }),
        db.from('issued_certificates').select('*', { count: 'exact', head: true }),
      ]);
      whitelistedUsers = userRes.count || 0;
      teamsFormed = teamRes.count || 0;
      competitionSubmissions = compRes.count || 0;
      certificatesIssued = certRes.count || 0;
    } catch (dbErr) {
      console.warn('[Analytics Server] Supabase stats count warning:', dbErr);
    }

    // Fetch persistent telemetry store
    const metrics = await fetchPersistentMetrics();

    // Check if day rolled over
    const todayPageViews = metrics.lastDate === today ? metrics.todayPageViews : 0;
    const todayUniqueVisitors = metrics.lastDate === today ? metrics.todayUniqueVisitors : 0;

    // Build 7-day history for the exact last 7 days
    const history7Days: DayTrafficStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const dayData = metrics.dailyHistory?.[dateStr];
      const views = dayData?.views || (dateStr === today ? todayPageViews : 0);
      const visitors = dayData?.visitors || (dateStr === today ? todayUniqueVisitors : 0);

      history7Days.push({
        date: dateStr,
        dayLabel,
        views,
        visitors,
      });
    }

    // Format top pages
    const totalViews = Math.max(metrics.totalPageViews, 0);
    const topPagesArray: TopPageStats[] = Object.entries(metrics.topPages || {})
      .map(([path, views]) => ({
        path,
        views,
        percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      vercelAnalyticsEnabled: true,
      redisCacheActive: !!redis,
      totalPageViews: metrics.totalPageViews,
      totalUniqueVisitors: metrics.totalUniqueVisitors,
      todayPageViews,
      todayUniqueVisitors,
      history7Days,
      topPages: topPagesArray,
      eventCounts: metrics.events || {},
      deviceBreakdown: metrics.devices || { desktop: 0, mobile: 0, tablet: 0, other: 0 },
      recentEvents: (metrics.recentEvents || []).slice(0, 20),
      platformConversions: {
        whitelistedUsers,
        teamsFormed,
        competitionSubmissions,
        certificatesIssued,
      },
      generatedAt: now.toISOString(),
    };
  });
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await invalidateCache('admin:analytics_summary');
}
