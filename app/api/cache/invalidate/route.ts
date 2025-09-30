import { NextRequest, NextResponse } from 'next/server'
import { smartCache } from '@/lib/cache'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type, pattern } = await request.json()

    switch (type) {
      case 'projects':
        smartCache.invalidateProjects()
        break
      case 'all':
        smartCache.invalidate()
        break
      case 'pattern':
        if (pattern) {
          smartCache.invalidate(pattern)
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid invalidation type' },
          { status: 400 }
        )
    }

    const stats = smartCache.getStats()
    
    return NextResponse.json({
      success: true,
      message: `Cache ${type === 'all' ? 'cleared' : 'invalidated'}`,
      stats
    })

  } catch (error) {
    console.error('Cache invalidation error:', error)
    return NextResponse.json(
      { error: 'Cache invalidation failed' },
      { status: 500 }
    )
  }
}

// Get cache statistics
export async function GET(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats = smartCache.getStats()
  
  return NextResponse.json({
    cache: stats,
    endpoints: {
      projects: '/api/projects',
      featured: '/api/projects/featured',
      github_stats: '/api/github-stats'
    }
  })
}