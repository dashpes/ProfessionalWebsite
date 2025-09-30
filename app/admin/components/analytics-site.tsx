'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, ExternalLink } from 'lucide-react'

interface TrendData {
  date: string
  count: number
}

interface SummaryData {
  totalViews: number
  recentViews: number
  viewGrowth: number
  totalProjects: number
  totalBlogPosts: number
  avgTimeSpentMinutes: number
  totalLikes: number
  totalProjectViews: number
  totalBlogViews: number
}

interface ReferrerData {
  referrer: string
  count: number
}

interface SiteAnalyticsData {
  summary: SummaryData
  period: { days: number }
  trends: {
    projectViews: TrendData[]
    blogViews: TrendData[]
  }
  topReferrers: ReferrerData[]
}

interface SiteAnalyticsProps {
  data: SiteAnalyticsData | null
  loading: boolean
}

export function SiteAnalytics({ data, loading }: SiteAnalyticsProps) {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-gray-400">Loading site analytics...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No analytics data available.</p>
      </div>
    )
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">
              {data.summary.recentViews} in last {data.period.days} days
              <span className={`ml-2 ${data.summary.viewGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.summary.viewGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.summary.viewGrowth)}%
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalProjects + data.summary.totalBlogPosts}</div>
            <p className="text-xs text-gray-400 mt-1">
              {data.summary.totalProjects} projects, {data.summary.totalBlogPosts} posts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg. Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.avgTimeSpentMinutes}m</div>
            <p className="text-xs text-gray-400 mt-1">Per session</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">Project likes</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topReferrers.slice(0, 8).map((ref, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="text-sm truncate">{ref.referrer}</span>
                  </div>
                  <span className="text-sm font-semibold">{ref.count}</span>
                </div>
              ))}
              {data.topReferrers.length === 0 && (
                <p className="text-gray-400 text-center py-4">No referrer data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Project Views</div>
                  <div className="text-2xl font-bold text-blue-400">{data.summary.totalProjectViews.toLocaleString()}</div>
                </div>
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Blog Views</div>
                  <div className="text-2xl font-bold text-purple-400">{data.summary.totalBlogViews.toLocaleString()}</div>
                </div>
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Project Views Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trends.projectViews.slice(0, 14).reverse().map((day) => {
                const maxCount = Math.max(...data.trends.projectViews.map((d) => d.count), 1)
                return (
                  <div key={day.date} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-20">{day.date}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min((day.count / maxCount) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{day.count}</span>
                  </div>
                )
              })}
              {data.trends.projectViews.length === 0 && (
                <p className="text-gray-400 text-center py-8">No data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Blog Views Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trends.blogViews.slice(0, 14).reverse().map((day) => {
                const maxCount = Math.max(...data.trends.blogViews.map((d) => d.count), 1)
                return (
                  <div key={day.date} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-20">{day.date}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min((day.count / maxCount) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{day.count}</span>
                  </div>
                )
              })}
              {data.trends.blogViews.length === 0 && (
                <p className="text-gray-400 text-center py-8">No data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}