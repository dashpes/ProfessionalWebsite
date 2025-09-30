import { NextRequest, NextResponse } from 'next/server'
import { db, getClientIP, hashIP, sanitizeUserAgent } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get client information
    const ip = getClientIP(request.headers)
    const ipHash = hashIP(ip)
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent') || undefined)
    const referrer = request.headers.get('referer')?.substring(0, 500) || null

    // Create view record and increment project view count
    await db.$transaction([
      db.projectView.create({
        data: {
          projectId,
          ipHash,
          userAgent,
          referrer,
          country: null, // Can be enhanced with geo-IP service
        },
      }),
      db.project.update({
        where: { id: projectId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track project view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}