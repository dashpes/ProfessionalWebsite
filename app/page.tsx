import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS, PROFESSIONAL_KEYWORDS } from '@/lib/seo'
import HeroSection from "./components/hero-section"
import SkillsSection from "./components/skills-section"
import GitHubStats from "./components/github-stats"
import FeaturedProjects from "./components/featured-projects"
import Footer from "./components/footer"

export const metadata: Metadata = generateMetadata({
  title: `${SEO_CONSTANTS.AUTHOR.name} - ${SEO_CONSTANTS.AUTHOR.jobTitle} Portfolio | Orange County Developer`,
  description: `${SEO_CONSTANTS.AUTHOR.name} is a ${SEO_CONSTANTS.AUTHOR.jobTitle} and Data Scientist in ${SEO_CONSTANTS.AUTHOR.location}. Explore my portfolio featuring React, Next.js, Python projects and technical expertise in ${PROFESSIONAL_KEYWORDS.slice(0, 8).join(', ')}.`,
  path: '',
  type: 'profile'
})

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1">
        <HeroSection />
        <SkillsSection />
        <FeaturedProjects />
        <GitHubStats />
      </main>
      <Footer />
    </div>
  )
}
