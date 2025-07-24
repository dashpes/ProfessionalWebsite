import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: `About ${SEO_CONSTANTS.AUTHOR.name} - Software Engineer & Data Scientist | Orange County`,
  description: `Learn about ${SEO_CONSTANTS.AUTHOR.name}, a passionate Software Engineer and Google-certified Data Analytics professional currently pursuing a Masters in Analytics at Georgia Tech. Based in ${SEO_CONSTANTS.AUTHOR.location}.`,
  path: '/about',
  type: 'profile'
})

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}