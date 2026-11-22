import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gamediscounttracker.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date() },
    { url: `${baseUrl}/discover`, lastModified: new Date() },
    { url: `${baseUrl}/deals/steam`, lastModified: new Date() },
    { url: `${baseUrl}/deals/epic`, lastModified: new Date() },
    { url: `${baseUrl}/free-games`, lastModified: new Date() },
    { url: `${baseUrl}/upcoming`, lastModified: new Date() },
    { url: `${baseUrl}/data-sources`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
  ];

  return staticRoutes;
}
