import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// This endpoint can be called by a cron job to auto-publish scheduled posts
export async function POST(request: NextRequest) {
  try {
    // Verify the cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'change-this-secret'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find all scheduled posts where publishedAt is in the past
    const scheduledPosts = await db.blogPost.findMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now
        }
      }
    })

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No scheduled posts to publish',
        count: 0
      })
    }

    // Update all scheduled posts to PUBLISHED
    const result = await db.blogPost.updateMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now
        }
      },
      data: {
        status: 'PUBLISHED'
      }
    })

    return NextResponse.json({
      message: `Successfully published ${result.count} scheduled posts`,
      count: result.count,
      posts: scheduledPosts.map(p => ({ id: p.id, title: p.title, publishedAt: p.publishedAt }))
    })
  } catch (error) {
    console.error('Failed to publish scheduled posts:', error)
    return NextResponse.json({ error: 'Failed to publish scheduled posts' }, { status: 500 })
  }
}