import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') // 'subscribed' or 'all'

    const skip = (page - 1) * limit

    const where = status === 'all' ? {} : { subscribed: true }

    const [subscribers, total] = await Promise.all([
      db.subscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit
      }),
      db.subscriber.count({ where })
    ])

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
