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
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    const [campaigns, total] = await Promise.all([
      db.emailCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.emailCampaign.count()
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
