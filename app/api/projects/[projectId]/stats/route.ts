import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get project stats
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        viewCount: true,
        likeCount: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      viewCount: project.viewCount,
      likeCount: project.likeCount,
    })
  } catch (error) {
    console.error('Failed to fetch project stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}