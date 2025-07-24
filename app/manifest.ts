import { MetadataRoute } from 'next'
import { SEO_CONSTANTS } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO_CONSTANTS.SITE_NAME,
    short_name: 'Daniel Ashpes',
    description: 'Software Engineer & Full Stack Developer portfolio showcasing projects and technical expertise.',
    start_url: '/',
    display: 'standalone',
    background_color: SEO_CONSTANTS.BRAND_COLORS.background,
    theme_color: SEO_CONSTANTS.BRAND_COLORS.primary,
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/android-chrome-512x512.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32', 
        type: 'image/png'
      }
    ],
    categories: ['developer-tools', 'portfolio', 'technology'],
    shortcuts: [
      {
        name: 'Projects',
        short_name: 'Projects',
        description: 'View my software projects',
        url: '/projects',
        icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }]
      },
      {
        name: 'Contact',
        short_name: 'Contact', 
        description: 'Get in touch',
        url: '/contact',
        icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }]
      }
    ]
  }
}