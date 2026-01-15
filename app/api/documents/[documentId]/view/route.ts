import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    // Get IP for hashing (privacy-preserving)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + documentId).digest('hex')

    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined

    // Check if document exists
    const document = await db.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Record view
    await db.documentView.create({
      data: {
        documentId,
        ipHash,
        userAgent,
        referrer
      }
    })

    // Increment view count
    await db.document.update({
      where: { id: documentId },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to record document view:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}
