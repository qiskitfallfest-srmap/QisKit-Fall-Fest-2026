import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.primaryDomain;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
