import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS, TECHNICAL_SKILLS } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: `Projects - ${SEO_CONSTANTS.AUTHOR.name} | Software Development Portfolio`,
  description: `Explore ${SEO_CONSTANTS.AUTHOR.name}'s software engineering projects including React, Next.js, Python, and data science applications. Full stack development portfolio showcasing ${TECHNICAL_SKILLS.slice(0, 6).join(', ')} and more.`,
  path: '/projects'
})

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}