import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params (default to last 30 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Aggregate analytics data
    const [
      totalProjects,
      totalViews,
      totalLikes,
      recentViews,
      recentLikes,
      topProjects,
      projectStats,
      dailyViews,
      dailyLikes,
    ] = await Promise.all([
      // Total counts
      db.project.count({ where: { status: 'ACTIVE' } }),
      db.projectView.count(),
      db.projectLike.count(),

      // Recent activity (last N days)
      db.projectView.count({
        where: {
          viewedAt: {
            gte: startDate,
          },
        },
      }),
      db.projectLike.count({
        where: {
          likedAt: {
            gte: startDate,
          },
        },
      }),

      // Top projects by views and likes
      db.project.findMany({
        where: { status: 'ACTIVE' },
        orderBy: [
          { viewCount: 'desc' },
          { likeCount: 'desc' },
        ],
        take: 10,
        select: {
          id: true,
          title: true,
          viewCount: true,
          likeCount: true,
          category: true,
        },
      }),

      // Individual project stats
      db.project.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          title: true,
          viewCount: true,
          likeCount: true,
          category: true,
          featured: true,
        },
        orderBy: {
          viewCount: 'desc',
        },
      }),

      // Daily view trend (last N days)
      db.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(viewed_at) as date, COUNT(*)::bigint as count
        FROM project_views
        WHERE viewed_at >= ${startDate}
        GROUP BY DATE(viewed_at)
        ORDER BY date DESC
      `,

      // Daily like trend (last N days)
      db.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(liked_at) as date, COUNT(*)::bigint as count
        FROM project_likes
        WHERE liked_at >= ${startDate}
        GROUP BY DATE(liked_at)
        ORDER BY date DESC
      `,
    ])

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

    const [previousViews, previousLikes] = await Promise.all([
      db.projectView.count({
        where: {
          viewedAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      db.projectLike.count({
        where: {
          likedAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
    ])

    const viewGrowth = previousViews > 0
      ? ((recentViews - previousViews) / previousViews) * 100
      : 100
    const likeGrowth = previousLikes > 0
      ? ((recentLikes - previousLikes) / previousLikes) * 100
      : 100

    // Format response
    return NextResponse.json({
      summary: {
        totalProjects,
        totalViews,
        totalLikes,
        recentViews,
        recentLikes,
        viewGrowth: Math.round(viewGrowth * 10) / 10,
        likeGrowth: Math.round(likeGrowth * 10) / 10,
      },
      topProjects,
      projectStats,
      trends: {
        views: dailyViews.map(row => ({
          date: row.date.toISOString().split('T')[0],
          count: Number(row.count),
        })),
        likes: dailyLikes.map(row => ({
          date: row.date.toISOString().split('T')[0],
          count: Number(row.count),
        })),
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}