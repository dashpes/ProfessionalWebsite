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

    const tags = await db.blogTag.findMany({
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

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Failed to fetch blog tags:', error)
    return NextResponse.json({ error: 'Failed to fetch blog tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Generate slug
    let slug = generateSlug(name)

    // Ensure slug is unique
    const existingTag = await db.blogTag.findUnique({ where: { slug } })
    if (existingTag) {
      slug = `${slug}-${Date.now()}`
    }

    const tag = await db.blogTag.create({
      data: {
        name,
        slug
      }
    })

    // Log admin activity
    await logAdminActivity(
      'CREATE',
      'blog_tag',
      tag.id,
      null,
      tag,
      getClientIP(request.headers),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Failed to create blog tag:', error)
    return NextResponse.json({ error: 'Failed to create blog tag' }, { status: 500 })
  }
}