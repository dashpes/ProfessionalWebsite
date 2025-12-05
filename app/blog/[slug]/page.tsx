import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/database'
import { SEO_CONSTANTS } from '@/lib/seo'
import { BlogPostContent } from './blog-post-content'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await db.blogPost.findUnique({
    where: { slug },
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

  // Only return published posts for public viewing
  if (!post || post.status !== 'PUBLISHED') {
    return null
  }

  return post
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || post.title

  return {
    title: `${title} | ${SEO_CONSTANTS.AUTHOR.name}`,
    description,
    keywords: post.keywords,
    authors: [{ name: SEO_CONSTANTS.AUTHOR.name }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [SEO_CONSTANTS.AUTHOR.name],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined
    },
    twitter: {
      card: post.coverImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined
    }
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  // Track view (fire and forget)
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog/posts/${slug}?track=true`).catch(() => {})

  // Transform post data for the client component
  const postData = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt?.toISOString() || '',
    readingTimeMinutes: post.readingTimeMinutes,
    category: post.categories[0]?.category ? {
      name: post.categories[0].category.name,
      color: post.categories[0].category.color || '#5B2C91'
    } : null,
    tags: post.tags.map(t => ({
      id: t.tag.id,
      name: t.tag.name
    }))
  }

  return <BlogPostContent post={postData} />
}
