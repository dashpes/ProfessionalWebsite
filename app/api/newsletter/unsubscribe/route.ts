import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      )
    }

    // Find subscriber by unsubscribe token
    const subscriber = await db.subscriber.findUnique({
      where: { unsubscribeToken: token }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      )
    }

    if (!subscriber.subscribed) {
      return NextResponse.json(
        { message: 'Already unsubscribed', alreadyUnsubscribed: true },
        { status: 200 }
      )
    }

    // Unsubscribe the user
    await db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        subscribed: false,
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Successfully unsubscribed',
      success: true
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
