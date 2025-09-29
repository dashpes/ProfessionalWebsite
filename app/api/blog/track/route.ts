import { NextRequest, NextResponse } from 'next/server'
import { trackBlogPostView } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, readingProgress, timeSpentSeconds } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    await trackBlogPostView(
      postId,
      request.headers,
      readingProgress,
      timeSpentSeconds
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track blog post view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}