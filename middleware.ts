import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a ratelimiter allowing 60 requests per 10 seconds per client
const ratelimit = (redisUrl && redisToken) ? new Ratelimit({
  redis: new Redis({
    url: redisUrl,
    token: redisToken,
  }),
  limiter: Ratelimit.slidingWindow(60, '10 s'),
  analytics: true,
}) : null;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    // Exempt high-frequency polling and webhook callbacks from coarse rate limiting
    if (
      pathname.startsWith('/api/qiskit/submission') ||
      pathname.startsWith('/api/analytics/track') ||
      pathname.startsWith('/api/payment/webhook')
    ) {
      return NextResponse.next();
    }

    if (ratelimit) {
      // Prioritize user session key to prevent hundreds of campus NAT Wi-Fi students colliding on a single IP
      let rateLimitKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
      const sessionCookie = request.cookies.get('qff_auth_session')?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(sessionCookie));
          if (parsed?.email) {
            rateLimitKey = `user:${parsed.email.toLowerCase().trim()}`;
          }
        } catch {}
      }

      const { success, limit, reset, remaining } = await ratelimit.limit(rateLimitKey);
      
      if (!success) {
        return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Content-Type': 'application/json',
          },
        });
      }
      
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
