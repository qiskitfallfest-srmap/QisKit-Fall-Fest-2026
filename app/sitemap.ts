import { MetadataRoute } from 'next';
import { ROUTE_RELEASE_CONFIG } from '@/config/page-release';
import { SITE_CONFIG } from '@/config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.primaryDomain;

  // Custom priority mapping for major live landing routes
  const priorityMap: Record<string, { priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = {
    '/': { priority: 1.0, changeFrequency: 'daily' },
    '/experience': { priority: 0.9, changeFrequency: 'daily' },
    '/schedule': { priority: 0.9, changeFrequency: 'daily' },
    '/venues': { priority: 0.8, changeFrequency: 'weekly' },
    '/about': { priority: 0.8, changeFrequency: 'weekly' },
    '/team': { priority: 0.7, changeFrequency: 'weekly' },
  };

  // Only include verified live routes in sitemap
  const liveRoutes = Object.values(ROUTE_RELEASE_CONFIG)
    .filter((route) => route.status === 'live')
    .map((route) => {
      const mapping = priorityMap[route.path] || { priority: 0.6, changeFrequency: 'weekly' };
      return {
        url: `${baseUrl}${route.path === '/' ? '' : route.path}`,
        lastModified: new Date(),
        changeFrequency: mapping.changeFrequency,
        priority: mapping.priority,
      };
    });

  return liveRoutes;
}
