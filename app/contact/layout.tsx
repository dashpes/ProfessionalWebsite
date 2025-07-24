import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: `Contact ${SEO_CONSTANTS.AUTHOR.name} - Software Engineer | Get In Touch`,
  description: `Contact ${SEO_CONSTANTS.AUTHOR.name}, Software Engineer and Data Scientist in ${SEO_CONSTANTS.AUTHOR.location}. Available for software development opportunities, consulting, and collaboration. Reach out at ${SEO_CONSTANTS.AUTHOR.email}.`,
  path: '/contact'
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}