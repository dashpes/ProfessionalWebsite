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

    // Check if user already liked this project
    const existingLike = await db.projectLike.findUnique({
      where: {
        projectId_ipHash: {
          projectId,
          ipHash,
        },
      },
    })

    if (existingLike) {
      // Unlike: Remove like and decrement count
      await db.$transaction([
        db.projectLike.delete({
          where: {
            id: existingLike.id,
          },
        }),
        db.project.update({
          where: { id: projectId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        }),
      ])

      return NextResponse.json({ liked: false, success: true })
    } else {
      // Like: Create like and increment count
      await db.$transaction([
        db.projectLike.create({
          data: {
            projectId,
            ipHash,
            userAgent,
          },
        }),
        db.project.update({
          where: { id: projectId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        }),
      ])

      return NextResponse.json({ liked: true, success: true })
    }
  } catch (error) {
    console.error('Failed to toggle project like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}

export async function GET(
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

    // Check if user liked this project
    const existingLike = await db.projectLike.findUnique({
      where: {
        projectId_ipHash: {
          projectId,
          ipHash,
        },
      },
    })

    return NextResponse.json({ liked: !!existingLike })
  } catch (error) {
    console.error('Failed to check project like status:', error)
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 })
  }
}