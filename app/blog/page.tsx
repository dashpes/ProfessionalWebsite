import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS, TECHNICAL_SKILLS } from '@/lib/seo'
import { db } from '@/lib/database'

export const metadata: Metadata = generateMetadata({
  title: `Blog - ${SEO_CONSTANTS.AUTHOR.name} | Software Engineering & Data Science Insights`,
  description: `Read ${SEO_CONSTANTS.AUTHOR.name}'s technical blog covering software engineering, data science, and development tutorials. Topics include ${TECHNICAL_SKILLS.slice(0, 5).join(', ')}, best practices, and industry insights.`,
  path: '/blog'
})

import { Intro } from "../components/intro"
import { HeroPost } from "../components/hero-post"
import { MoreStories } from "../components/more-stories"
import { Newsletter } from "../components/newsletter"
import Footer from "../components/footer"

async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    })

    return posts.map(post => ({
      slug: post.slug,
      title: post.title,
      coverImage: post.coverImage || "/placeholder.png?height=630&width=1300",
      date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      author: {
        name: SEO_CONSTANTS.AUTHOR.name,
        picture: "/placeholder-user.png",
      },
      excerpt: post.excerpt || post.title.substring(0, 160)
    }))
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return []
  }
}

export default async function BlogPage() {
  const allPosts = await getBlogPosts()
  const heroPost = allPosts[0] // Get the first post as hero
  const morePosts = allPosts.slice(1) // Get the rest as more stories

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <Intro />
        {heroPost && (
          <HeroPost
            title={heroPost.title}
            coverImage={heroPost.coverImage}
            date={heroPost.date}
            author={heroPost.author}
            slug={heroPost.slug}
            excerpt={heroPost.excerpt}
          />
        )}
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        {allPosts.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">No Blog Posts Yet</h2>
            <p className="text-gray-400">Check back soon for new content!</p>
          </div>
        )}
      </div>
      <Newsletter />
      <Footer />
    </div>
  )
}
