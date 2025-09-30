import { NextRequest, NextResponse } from 'next/server'
import { db, logAdminActivity, getClientIP } from '@/lib/database'
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') as BlogPostStatus | null
    const featured = searchParams.get('featured') === 'true'
    const isAdmin = searchParams.get('admin') === 'true'

    // Only check admin auth if admin parameter is true
    if (isAdmin) {
      const authResult = verifyAdminToken(request)
      if (!authResult.valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      status?: BlogPostStatus
      featured?: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        excerpt?: { contains: string; mode: 'insensitive' }
        content?: { contains: string; mode: 'insensitive' }
      }>
      categories?: {
        some: {
          category: {
            slug: string
          }
        }
      }
      tags?: {
        some: {
          tag: {
            slug: string
          }
        }
      }
    } = {}

    // For non-admin requests, only show published posts (including scheduled posts that should be live)
    if (!isAdmin) {
      where.status = 'PUBLISHED'
      // Note: Scheduled posts must be manually published or auto-published by a cron job
      // They won't automatically appear here until status changes to PUBLISHED
    } else if (status) {
      where.status = status
    }

    if (featured) {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      }
    }

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
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
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.blogPost.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      coverImage,
      status: rawStatus,
      featured = false,
      metaTitle,
      metaDescription,
      keywords = [],
      categories = [],
      tags = [],
      publishedAt
    } = body

    // Ensure status is valid, default to DRAFT if empty or invalid
    const status = rawStatus && ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'].includes(rawStatus)
      ? rawStatus
      : 'DRAFT'

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Generate slug from title
    let slug = generateSlug(title)

    // Ensure slug is unique
    const existingPost = await db.blogPost.findUnique({ where: { slug } })
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    // Calculate reading time
    const readingTimeMinutes = calculateReadingTime(content)

    // Create the blog post
    const post = await db.blogPost.create({
      data: {
        slug,
        title,
        content,
        excerpt: excerpt || title.substring(0, 160),
        coverImage: coverImage || null,
        status: status as BlogPostStatus,
        featured,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || title.substring(0, 160),
        keywords,
        readingTimeMinutes,
        publishedAt: status === 'PUBLISHED' && publishedAt ? new Date(publishedAt) :
                    status === 'PUBLISHED' ? new Date() : null
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

    // Handle categories
    if (categories.length > 0) {
      for (const categoryName of categories) {
        // Create category if it doesn't exist
        const categorySlug = generateSlug(categoryName)
        const category = await db.blogCategory.upsert({
          where: { slug: categorySlug },
          update: {},
          create: {
            name: categoryName,
            slug: categorySlug
          }
        })

        // Link to post
        await db.blogPostCategory.create({
          data: {
            postId: post.id,
            categoryId: category.id
          }
        })
      }
    }

    // Handle tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Create tag if it doesn't exist
        const tagSlug = generateSlug(tagName)
        const tag = await db.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug
          }
        })

        // Link to post
        await db.blogPostTag.create({
          data: {
            postId: post.id,
            tagId: tag.id
          }
        })
      }
    }

    // Log admin activity
    await logAdminActivity(
      'CREATE',
      'blog_post',
      post.id,
      null,
      post,
      getClientIP(request.headers),
      request.headers.get('user-agent') || undefined
    )

    // Fetch the complete post with relations
    const completePost = await db.blogPost.findUnique({
      where: { id: post.id },
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

    return NextResponse.json(completePost, { status: 201 })
  } catch (error) {
    console.error('Failed to create blog post:', error)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}