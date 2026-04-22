import { MetadataRoute } from 'next';
import { siteConfig } from '@/data/config/site.settings';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteConfig.siteUrl;

  const routes = [
    '',
    'about',
    'contact',
    'pricing',
    'faq',
    'league/public/matches',
    'terms',
    'privacy',
    'security',
    'status'
  ].map((route) => ({
    url: `${siteUrl}${route ? `/${route}` : ''}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
