import { MetadataRoute } from 'next'
import { SEO_CONSTANTS } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/_next/*',
          '/private/*'
        ]
      }
    ],
    sitemap: `${SEO_CONSTANTS.SITE_URL}/sitemap.xml`,
    host: SEO_CONSTANTS.SITE_URL
  }
}