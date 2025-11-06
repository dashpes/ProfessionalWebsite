import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'
import {
  generateBlogPostEmail,
  generateCustomEmail,
  sendBulkNewsletter
} from '@/lib/newsletter-email'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, blogPostId, subject, content, htmlContent } = body

    // Validate request
    if (!type || !subject) {
      return NextResponse.json(
        { error: 'Type and subject are required' },
        { status: 400 }
      )
    }

    // Check newsletter email configuration
    if (!process.env.NEWSLETTER_EMAIL || !process.env.NEWSLETTER_PASSWORD) {
      return NextResponse.json(
        { error: 'Newsletter email not configured. Please set NEWSLETTER_EMAIL and NEWSLETTER_PASSWORD environment variables.' },
        { status: 500 }
      )
    }

    // Get all active subscribers
    const subscribers = await db.subscriber.findMany({
      where: { subscribed: true },
      select: { email: true, unsubscribeToken: true }
    })

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      )
    }

    // Create campaign record
    const campaign = await db.emailCampaign.create({
      data: {
        subject,
        content: content || '',
        htmlContent: htmlContent || null,
        blogPostId: blogPostId || null,
        recipientCount: subscribers.length,
        status: 'SENDING'
      }
    })

    // Generate HTML based on type
    let generateHtmlFn: (token: string) => string

    if (type === 'blog-post' && blogPostId) {
      // Fetch blog post data
      const blogPost = await db.blogPost.findUnique({
        where: { id: blogPostId }
      })

      if (!blogPost) {
        await db.emailCampaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' }
        })
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        )
      }

      generateHtmlFn = (token: string) =>
        generateBlogPostEmail(
          {
            title: blogPost.title,
            excerpt: blogPost.excerpt || blogPost.title.substring(0, 160),
            coverImage: blogPost.coverImage || undefined,
            slug: blogPost.slug,
            publishedAt: blogPost.publishedAt?.toISOString() || blogPost.createdAt.toISOString()
          },
          token
        )
    } else if (type === 'custom') {
      generateHtmlFn = (token: string) =>
        generateCustomEmail(
          {
            subject,
            content: content || '',
            htmlContent: htmlContent || undefined
          },
          token
        )
    } else {
      await db.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: 'FAILED' }
      })
      return NextResponse.json(
        { error: 'Invalid campaign type' },
        { status: 400 }
      )
    }

    // Send emails
    const results = await sendBulkNewsletter(subject, generateHtmlFn, subscribers)

    // Update campaign status
    await db.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: results.failed === 0 ? 'SENT' : 'FAILED',
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      message: `Campaign sent to ${results.sent} subscribers`,
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
      campaignId: campaign.id
    })
  } catch (error) {
    console.error('Failed to send campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    )
  }
}
