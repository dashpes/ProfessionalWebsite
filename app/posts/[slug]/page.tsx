import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata, generateBlogPostSchema, SEO_CONSTANTS } from '@/lib/seo'
import { PostHeader } from "../../components/post-header"
import { PostBody } from "../../components/post-body"
import { PostFooter } from "../../components/post-footer"
import { NewsletterPopup } from "../../components/newsletter-popup"
import { db, trackBlogPostView } from '@/lib/database'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'

async function getBlogPost(slug: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: {
        slug,
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
      }
    })

    if (!post) {
      return null
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage || "/placeholder.png?height=630&width=1300",
      date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: {
        name: SEO_CONSTANTS.AUTHOR.name,
        picture: "/placeholder-user.png",
      },
      slug: post.slug,
      readingTime: post.readingTimeMinutes,
      viewCount: post.viewCount,
      featured: post.featured,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords,
      categories: post.categories.map(c => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug
      })),
      tags: post.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug
      }))
    }
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return null
  }
}

// Generate metadata for the blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return generateSEOMetadata({
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
      path: `/posts/${params.slug}`
    })
  }

  return generateSEOMetadata({
    title: `${post.metaTitle || post.title} - ${SEO_CONSTANTS.AUTHOR.name} Blog`,
    description: post.metaDescription || post.excerpt || `${post.content.substring(0, 160)}...`,
    path: `/posts/${params.slug}`,
    image: post.coverImage,
    type: 'article',
    keywords: post.keywords
  })
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  // Track the view server-side
  const headersList = headers()
  try {
    await trackBlogPostView(post.id, headersList)
  } catch (error) {
    // Fail silently for view tracking
    console.error('Failed to track post view:', error)
  }

  const blogPostSchema = generateBlogPostSchema({
    title: post.title,
    description: post.metaDescription || post.excerpt || `${post.content.substring(0, 160)}...`,
    datePublished: post.date,
    dateModified: post.updatedAt,
    url: `${SEO_CONSTANTS.SITE_URL}/posts/${params.slug}`,
    image: post.coverImage,
    keywords: post.keywords
  })

  return (
    <div className="bg-black text-white">
      <NewsletterPopup />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema),
        }}
      />
      <div className="container mx-auto px-5">
        <PostHeader
          title={post.title}
          coverImage={post.coverImage}
          date={post.date}
          author={post.author}
          readingTime={post.readingTime}
          viewCount={post.viewCount}
          categories={post.categories}
          tags={post.tags}
        />
        <PostBody content={post.content} />
        <PostFooter slug={post.slug} title={post.title} />
      </div>
    </div>
  )
}
