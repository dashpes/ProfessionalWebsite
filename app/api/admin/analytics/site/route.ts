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

    // Aggregate site-wide analytics data
    const [
      totalProjects,
      totalBlogPosts,
      totalProjectViews,
      totalBlogViews,
      totalProjectLikes,
      recentProjectViews,
      recentBlogViews,
      dailyProjectViews,
      dailyBlogViews,
      topPages,
    ] = await Promise.all([
      // Total counts
      db.project.count({ where: { status: 'ACTIVE' } }),
      db.blogPost.count({ where: { status: 'PUBLISHED' } }),
      db.projectView.count(),
      db.blogPostView.count(),
      db.projectLike.count(),

      // Recent activity (last N days)
      db.projectView.count({
        where: { viewedAt: { gte: startDate } },
      }),
      db.blogPostView.count({
        where: { viewedAt: { gte: startDate } },
      }),
      db.projectLike.count({
        where: { likedAt: { gte: startDate } },
      }),

      // Daily project view trend
      db.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(viewed_at) as date, COUNT(*)::bigint as count
        FROM project_views
        WHERE viewed_at >= ${startDate}
        GROUP BY DATE(viewed_at)
        ORDER BY date DESC
      `,

      // Daily blog view trend
      db.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(viewed_at) as date, COUNT(*)::bigint as count
        FROM blog_post_views
        WHERE viewed_at >= ${startDate}
        GROUP BY DATE(viewed_at)
        ORDER BY date DESC
      `,

      // Top referrers
      db.$queryRaw<Array<{ referrer: string; count: bigint }>>`
        SELECT
          COALESCE(referrer, 'Direct') as referrer,
          COUNT(*)::bigint as count
        FROM (
          SELECT referrer FROM project_views WHERE viewed_at >= ${startDate}
          UNION ALL
          SELECT referrer FROM blog_post_views WHERE viewed_at >= ${startDate}
        ) AS combined
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `,
    ])

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

    const [previousProjectViews, previousBlogViews] = await Promise.all([
      db.projectView.count({
        where: {
          viewedAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      db.blogPostView.count({
        where: {
          viewedAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
    ])

    const totalRecentViews = recentProjectViews + recentBlogViews
    const totalPreviousViews = previousProjectViews + previousBlogViews
    const viewGrowth = totalPreviousViews > 0
      ? ((totalRecentViews - totalPreviousViews) / totalPreviousViews) * 100
      : 100

    // Calculate average time spent (from blog posts with tracking)
    const avgTimeSpent = await db.blogPostView.aggregate({
      where: {
        viewedAt: { gte: startDate },
        timeSpentSeconds: { not: null },
      },
      _avg: {
        timeSpentSeconds: true,
      },
    })

    // Format response
    return NextResponse.json({
      summary: {
        totalProjects,
        totalBlogPosts,
        totalViews: totalProjectViews + totalBlogViews,
        totalProjectViews,
        totalBlogViews,
        totalLikes: totalProjectLikes,
        recentViews: totalRecentViews,
        viewGrowth: Math.round(viewGrowth * 10) / 10,
        avgTimeSpentMinutes: avgTimeSpent._avg.timeSpentSeconds
          ? Math.round((avgTimeSpent._avg.timeSpentSeconds / 60) * 10) / 10
          : 0,
      },
      trends: {
        projectViews: dailyProjectViews.map(row => ({
          date: row.date.toISOString().split('T')[0],
          count: Number(row.count),
        })),
        blogViews: dailyBlogViews.map(row => ({
          date: row.date.toISOString().split('T')[0],
          count: Number(row.count),
        })),
      },
      topReferrers: topPages.map(row => ({
        referrer: row.referrer || 'Direct',
        count: Number(row.count),
      })),
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch site analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}