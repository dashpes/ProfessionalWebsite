import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete the subscriber
    await db.subscriber.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Subscriber deleted successfully',
      success: true
    })
  } catch (error) {
    console.error('Failed to delete subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    )
  }
}
