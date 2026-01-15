import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

// GET all documents (admin)
export async function GET(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const documents = await db.document.findMany({
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, excerpt, fileUrl, fileName, coverImage, status, featured, categoryIds, tagIds } = body

    if (!title || !slug || !fileUrl || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug is unique
    const existingDoc = await db.document.findUnique({
      where: { slug }
    })

    if (existingDoc) {
      return NextResponse.json({ error: 'Document with this slug already exists' }, { status: 400 })
    }

    const document = await db.document.create({
      data: {
        title,
        slug,
        excerpt,
        fileUrl,
        fileName,
        coverImage,
        status: status || 'DRAFT',
        featured: featured || false,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        categories: {
          create: (categoryIds || []).map((categoryId: string) => ({
            categoryId
          }))
        },
        tags: {
          create: (tagIds || []).map((tagId: string) => ({
            tagId
          }))
        }
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
