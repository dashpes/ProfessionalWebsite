import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth'
import { generateBlogPostEmail, generateCustomEmail } from '@/lib/newsletter-email'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAdminToken(authHeader.replace('Bearer ', ''))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, blogPostId, subject, content } = body

    let html: string

    if (type === 'blog-post' && blogPostId) {
      // Fetch blog post data
      const blogPost = await db.blogPost.findUnique({
        where: { id: blogPostId }
      })

      if (!blogPost) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        )
      }

      html = generateBlogPostEmail(
        {
          title: blogPost.title,
          excerpt: blogPost.excerpt || blogPost.title.substring(0, 160),
          coverImage: blogPost.coverImage || undefined,
          slug: blogPost.slug,
          publishedAt: blogPost.publishedAt?.toISOString() || blogPost.createdAt.toISOString()
        },
        'preview-token-12345' // Dummy token for preview
      )
    } else if (type === 'custom') {
      html = generateCustomEmail(
        {
          subject: subject || 'Email Subject',
          content: content || 'Email content will appear here...',
          htmlContent: content
        },
        'preview-token-12345' // Dummy token for preview
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid preview type' },
        { status: 400 }
      )
    }

    return NextResponse.json({ html })
  } catch (error) {
    console.error('Failed to generate preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
