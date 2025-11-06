import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if subscriber already exists
    const existingSubscriber = await db.subscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        )
      } else {
        // Re-subscribe a previously unsubscribed user
        await db.subscriber.update({
          where: { email: email.toLowerCase() },
          data: {
            subscribed: true,
            unsubscribedAt: null,
            subscribedAt: new Date()
          }
        })

        return NextResponse.json({
          message: 'Successfully re-subscribed to newsletter',
          success: true
        })
      }
    }

    // Create new subscriber
    await db.subscriber.create({
      data: {
        email: email.toLowerCase()
      }
    })

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      success: true
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
