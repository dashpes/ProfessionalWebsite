import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

// GET single document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { documentId } = await params
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Failed to fetch document:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

// PUT update document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { documentId } = await params
    const body = await request.json()
    const { title, slug, excerpt, fileUrl, fileName, coverImage, status, featured, categoryIds, tagIds } = body

    // Check if document exists
    const existingDoc = await db.document.findUnique({
      where: { id: documentId }
    })

    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if new slug conflicts with another document
    if (slug && slug !== existingDoc.slug) {
      const conflictingDoc = await db.document.findUnique({
        where: { slug }
      })
      if (conflictingDoc) {
        return NextResponse.json({ error: 'Document with this slug already exists' }, { status: 400 })
      }
    }

    // Determine publishedAt
    let publishedAt = existingDoc.publishedAt
    if (status === 'PUBLISHED' && !existingDoc.publishedAt) {
      publishedAt = new Date()
    } else if (status === 'DRAFT') {
      publishedAt = null
    }

    // Update document
    const document = await db.document.update({
      where: { id: documentId },
      data: {
        title: title ?? existingDoc.title,
        slug: slug ?? existingDoc.slug,
        excerpt: excerpt !== undefined ? excerpt : existingDoc.excerpt,
        fileUrl: fileUrl ?? existingDoc.fileUrl,
        fileName: fileName ?? existingDoc.fileName,
        coverImage: coverImage !== undefined ? coverImage : existingDoc.coverImage,
        status: status ?? existingDoc.status,
        featured: featured !== undefined ? featured : existingDoc.featured,
        publishedAt,
        categories: categoryIds ? {
          deleteMany: {},
          create: categoryIds.map((categoryId: string) => ({ categoryId }))
        } : undefined,
        tags: tagIds ? {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({ tagId }))
        } : undefined
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

// DELETE document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { documentId } = await params

    await db.document.delete({
      where: { id: documentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
