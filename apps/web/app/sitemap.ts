import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://igshorts.com';
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/charts/global`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/charts/india`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/charts`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/trending`, lastModified, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/trending/music`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/trending/news`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    {
      url: `${baseUrl}/trending/internet-culture`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trending/entertainment`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    { url: `${baseUrl}/trending/technology`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    {
      url: `${baseUrl}/trending/sports-gaming`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    { url: `${baseUrl}/music`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/movers`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/profiles`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/methodology`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const apiUrl = (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000/api/v1'
    ).replace(/\/+$/, '');

    const profileRoutes: MetadataRoute.Sitemap = [];
    const pageSize = 200;
    let offset = 0;
    let hasMore = true;

    while (hasMore && offset < 2000) {
      const res = await fetch(`${apiUrl}/profiles?limit=${pageSize}&offset=${offset}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = (await res.json()) as {
        data?: Array<{ username?: string; igUsername?: string }>;
        meta?: { has_more?: boolean };
      };
      const profiles = json.data || [];
      for (const p of profiles) {
        const handle = p.igUsername || p.username;
        if (!handle) continue;
        profileRoutes.push({
          url: `${baseUrl}/profiles/${encodeURIComponent(handle)}`,
          lastModified,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      }
      hasMore = Boolean(json.meta?.has_more) && profiles.length > 0;
      offset += pageSize;
    }

    return [...staticRoutes, ...profileRoutes];
  } catch {
    // If API is unreachable during build/generation, return static routes gracefully
  }

  return staticRoutes;
}
