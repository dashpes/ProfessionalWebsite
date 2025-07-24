import type { Metadata } from 'next'
import { generateMetadata, SEO_CONSTANTS, TECHNICAL_SKILLS } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: `Blog - ${SEO_CONSTANTS.AUTHOR.name} | Software Engineering & Data Science Insights`,
  description: `Read ${SEO_CONSTANTS.AUTHOR.name}'s technical blog covering software engineering, data science, and development tutorials. Topics include ${TECHNICAL_SKILLS.slice(0, 5).join(', ')}, best practices, and industry insights.`,
  path: '/blog'
})

import { Intro } from "../components/intro"
import { HeroPost } from "../components/hero-post"
import { MoreStories } from "../components/more-stories"
import { Newsletter } from "../components/newsletter"
import { Footer } from "../components/footer"

// Placeholder data for blog posts
const DUMMY_POSTS = [
  {
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js",
    coverImage: "/placeholder.png?height=630&width=1300",
    date: "2023-04-05T05:35:07.322Z",
    author: {
      name: "Daniel Ashpes",
      picture: "/placeholder-user.png",
    },
    excerpt: "A comprehensive guide to setting up your first Next.js project and understanding its core concepts.",
  },
  {
    slug: "data-analysis-with-python",
    title: "Unlocking Insights: Data Analysis with Python",
    coverImage: "/placeholder.png?height=630&width=1300",
    date: "2023-03-20T10:00:00.000Z",
    author: {
      name: "Daniel Ashpes",
      picture: "/placeholder-user.png",
    },
    excerpt:
      "Explore the power of Python libraries like Pandas and NumPy for effective data analysis and manipulation.",
  },
  {
    slug: "building-restful-apis-node",
    title: "Building Robust RESTful APIs with Node.js and Express",
    coverImage: "/placeholder.png?height=630&width=1300",
    date: "2023-02-15T14:30:00.000Z",
    author: {
      name: "Daniel Ashpes",
      picture: "/placeholder-user.png",
    },
    excerpt:
      "Learn how to design and implement efficient and secure RESTful APIs using Node.js and the Express framework.",
  },
]

export default function BlogPage() {
  const heroPost = DUMMY_POSTS[0]
  const morePosts = DUMMY_POSTS.slice(1)

  return (
    <div className="bg-black text-white">
      <div className="container mx-auto px-5">
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
      </div>
      <Newsletter />
      <Footer />
    </div>
  )
}
