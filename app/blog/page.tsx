import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS, TECHNICAL_SKILLS } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: `Blog - ${SEO_CONSTANTS.AUTHOR.name} | Software Engineering & Data Science Insights`,
  description: `Read ${SEO_CONSTANTS.AUTHOR.name}'s technical blog covering software engineering, data science, and development tutorials. Topics include ${TECHNICAL_SKILLS.slice(0, 5).join(', ')}, best practices, and industry insights.`,
  path: '/blog'
})

import { MindCloud } from "../components/mind-cloud"

export default function BlogPage() {
  return (
    <div className="fixed inset-0 pt-16 bg-black">
      <MindCloud className="w-full h-full" />
    </div>
  )
}
