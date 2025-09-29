import { NextRequest, NextResponse } from 'next/server'
import { db, logAdminActivity, getClientIP } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePostCount = searchParams.get('count') === 'true'

    const categories = await db.blogCategory.findMany({
      orderBy: {
        name: 'asc'
      },
      include: includePostCount ? {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      } : undefined
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch blog categories:', error)
    return NextResponse.json({ error: 'Failed to fetch blog categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Generate slug
    let slug = generateSlug(name)

    // Ensure slug is unique
    const existingCategory = await db.blogCategory.findUnique({ where: { slug } })
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`
    }

    const category = await db.blogCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || null
      }
    })

    // Log admin activity
    await logAdminActivity(
      'CREATE',
      'blog_category',
      category.id,
      null,
      category,
      getClientIP(request.headers),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Failed to create blog category:', error)
    return NextResponse.json({ error: 'Failed to create blog category' }, { status: 500 })
  }
}