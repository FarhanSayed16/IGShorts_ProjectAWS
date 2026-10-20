import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://igshorts.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/hashtags',
          '/news',
          '/regions',
          '/scoring',
          '/account',
          '/claim',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
