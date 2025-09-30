import { NextRequest, NextResponse } from 'next/server'
import { db, logAdminActivity, getClientIP, trackBlogPostView } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'
import { BlogPostStatus } from '@prisma/client'

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const trackView = searchParams.get('track') !== 'false'

    // Check if admin request
    if (isAdmin) {
      const authResult = verifyAdminToken(request)
      if (!authResult.valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Find post by ID or slug
    const where = id.match(/^[0-9a-f]{12,}$/i) ? { id } : { slug: id }

    const post = await db.blogPost.findUnique({
      where,
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
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // For non-admin requests, only return published posts
    if (!isAdmin && post.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Track view for published posts (non-admin requests)
    if (!isAdmin && post.status === 'PUBLISHED' && trackView) {
      await trackBlogPostView(post.id, request.headers)
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Get existing post
    const existingPost = await db.blogPost.findUnique({
      where: { id },
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

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    const {
      title,
      content,
      excerpt,
      coverImage,
      status,
      featured,
      metaTitle,
      metaDescription,
      keywords,
      categories = [],
      tags = [],
      publishedAt
    } = body

    // Update slug if title changed
    let slug = existingPost.slug
    if (title && title !== existingPost.title) {
      const newSlug = generateSlug(title)
      const existingWithSlug = await db.blogPost.findUnique({ where: { slug: newSlug } })
      if (!existingWithSlug || existingWithSlug.id === id) {
        slug = newSlug
      } else {
        slug = `${newSlug}-${Date.now()}`
      }
    }

    // Calculate reading time if content changed
    let readingTimeMinutes = existingPost.readingTimeMinutes
    if (content && content !== existingPost.content) {
      readingTimeMinutes = calculateReadingTime(content)
    }

    // Handle publish date
    let publishDate = existingPost.publishedAt
    if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishDate = publishedAt ? new Date(publishedAt) : new Date()
    } else if (publishedAt) {
      publishDate = new Date(publishedAt)
    }

    // Update the blog post
    const updatedPost = await db.blogPost.update({
      where: { id },
      data: {
        slug,
        title: title || existingPost.title,
        content: content || existingPost.content,
        excerpt: excerpt !== undefined ? excerpt : existingPost.excerpt,
        coverImage: coverImage !== undefined ? coverImage : existingPost.coverImage,
        status: (status as BlogPostStatus) || existingPost.status,
        featured: featured !== undefined ? featured : existingPost.featured,
        metaTitle: metaTitle !== undefined ? metaTitle : existingPost.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existingPost.metaDescription,
        keywords: keywords !== undefined ? keywords : existingPost.keywords,
        readingTimeMinutes,
        publishedAt: publishDate
      }
    })

    // Handle categories update
    if (categories.length >= 0) {
      // Remove existing categories
      await db.blogPostCategory.deleteMany({
        where: { postId: id }
      })

      // Add new categories
      for (const categoryName of categories) {
        const categorySlug = generateSlug(categoryName)
        const category = await db.blogCategory.upsert({
          where: { slug: categorySlug },
          update: {},
          create: {
            name: categoryName,
            slug: categorySlug
          }
        })

        await db.blogPostCategory.create({
          data: {
            postId: id,
            categoryId: category.id
          }
        })
      }
    }

    // Handle tags update
    if (tags.length >= 0) {
      // Remove existing tags
      await db.blogPostTag.deleteMany({
        where: { postId: id }
      })

      // Add new tags
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName)
        const tag = await db.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug
          }
        })

        await db.blogPostTag.create({
          data: {
            postId: id,
            tagId: tag.id
          }
        })
      }
    }

    // Log admin activity
    await logAdminActivity(
      'UPDATE',
      'blog_post',
      id,
      existingPost,
      updatedPost,
      getClientIP(request.headers),
      request.headers.get('user-agent') || undefined
    )

    // Fetch the complete updated post
    const completePost = await db.blogPost.findUnique({
      where: { id },
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

    return NextResponse.json(completePost)
  } catch (error) {
    console.error('Failed to update blog post:', error)
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get existing post for logging
    const existingPost = await db.blogPost.findUnique({
      where: { id },
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

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Delete the blog post (this will cascade delete relations)
    await db.blogPost.delete({
      where: { id }
    })

    // Log admin activity
    await logAdminActivity(
      'DELETE',
      'blog_post',
      id,
      existingPost,
      null,
      getClientIP(request.headers),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}