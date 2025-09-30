import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params (default to last 30 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Aggregate blog analytics data
    const [
      totalPosts,
      publishedPosts,
      totalViews,
      recentViews,
      topPosts,
      postStats,
      dailyViews,
      avgReadingProgress,
      categoryBreakdown,
      readerEngagement,
    ] = await Promise.all([
      // Total counts
      db.blogPost.count(),
      db.blogPost.count({ where: { status: 'PUBLISHED' } }),
      db.blogPostView.count(),

      // Recent activity (last N days)
      db.blogPostView.count({
        where: {
          viewedAt: {
            gte: startDate,
          },
        },
      }),

      // Top posts by views
      db.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: {
          viewCount: 'desc',
        },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          readingTimeMinutes: true,
          featured: true,
          publishedAt: true,
        },
      }),

      // Individual post stats
      db.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          readingTimeMinutes: true,
          featured: true,
          publishedAt: true,
        },
        orderBy: {
          viewCount: 'desc',
        },
      }),

      // Daily view trend (last N days)
      db.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(viewed_at) as date, COUNT(*)::bigint as count
        FROM blog_post_views
        WHERE viewed_at >= ${startDate}
        GROUP BY DATE(viewed_at)
        ORDER BY date DESC
      `,

      // Average reading progress
      db.blogPostView.aggregate({
        where: {
          viewedAt: { gte: startDate },
          readingProgress: { not: null },
        },
        _avg: {
          readingProgress: true,
        },
      }),

      // Category breakdown (using blog categories)
      db.blogCategory.findMany({
        include: {
          posts: {
            include: {
              post: {
                select: {
                  viewCount: true,
                  status: true,
                },
              },
            },
          },
        },
      }),

      // Reader engagement metrics
      db.blogPostView.aggregate({
        where: {
          viewedAt: { gte: startDate },
        },
        _avg: {
          timeSpentSeconds: true,
          readingProgress: true,
        },
        _count: true,
      }),
    ])

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

    const previousViews = await db.blogPostView.count({
      where: {
        viewedAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    })

    const viewGrowth = previousViews > 0
      ? ((recentViews - previousViews) / previousViews) * 100
      : 100

    // Process category breakdown
    const categoryStats = categoryBreakdown.map(cat => ({
      category: cat.name,
      postCount: cat.posts.filter(p => p.post.status === 'PUBLISHED').length,
      totalViews: cat.posts.reduce((sum, p) => sum + (p.post.viewCount || 0), 0),
    }))

    // Format response
    return NextResponse.json({
      summary: {
        totalPosts,
        publishedPosts,
        draftPosts: totalPosts - publishedPosts,
        totalViews,
        recentViews,
        viewGrowth: Math.round(viewGrowth * 10) / 10,
        avgViewsPerPost: publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0,
        avgReadingProgress: avgReadingProgress._avg.readingProgress
          ? Math.round(Number(avgReadingProgress._avg.readingProgress) * 10) / 10
          : 0,
        avgTimeSpentMinutes: readerEngagement._avg.timeSpentSeconds
          ? Math.round((readerEngagement._avg.timeSpentSeconds / 60) * 10) / 10
          : 0,
        completionRate: readerEngagement._avg.readingProgress
          ? Math.round(Number(readerEngagement._avg.readingProgress))
          : 0,
      },
      topPosts: topPosts.map(post => ({
        ...post,
        publishedAt: post.publishedAt?.toISOString(),
      })),
      postStats: postStats.map(post => ({
        ...post,
        publishedAt: post.publishedAt?.toISOString(),
      })),
      trends: {
        views: dailyViews.map(row => ({
          date: row.date.toISOString().split('T')[0],
          count: Number(row.count),
        })),
      },
      categories: categoryStats,
      engagement: {
        avgTimeSpentMinutes: readerEngagement._avg.timeSpentSeconds
          ? Math.round((readerEngagement._avg.timeSpentSeconds / 60) * 10) / 10
          : 0,
        avgReadingProgress: readerEngagement._avg.readingProgress
          ? Math.round(Number(readerEngagement._avg.readingProgress) * 10) / 10
          : 0,
        totalReads: readerEngagement._count,
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch blog analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}