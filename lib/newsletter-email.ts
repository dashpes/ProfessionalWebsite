import nodemailer from 'nodemailer'

// HTML escape function to prevent injection attacks
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface BlogPostEmailData {
  title: string
  excerpt: string
  coverImage?: string
  slug: string
  publishedAt: string
}

interface CustomEmailData {
  subject: string
  content: string
  htmlContent?: string
}

// Create transporter for newsletter emails
function createNewsletterTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEWSLETTER_EMAIL,
      pass: process.env.NEWSLETTER_PASSWORD
    }
  })
}

// Generate blog post announcement HTML email
export function generateBlogPostEmail(data: BlogPostEmailData, unsubscribeToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/posts/${data.slug}`
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #5B2C91 0%, #7B3FB2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Blog Post</h1>
            </td>
          </tr>

          <!-- Cover Image -->
          ${data.coverImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${escapeHtml(data.coverImage)}" alt="${escapeHtml(data.title)}" style="width: 100%; height: auto; display: block; border: none;">
            </td>
          </tr>
          ` : ''}

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #2A2A2A; font-size: 24px; font-weight: bold;">${escapeHtml(data.title)}</h2>
              <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;">${escapeHtml(data.excerpt)}</p>

              <!-- CTA Button -->
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="border-radius: 6px; background-color: #5B2C91;">
                    <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">Read Full Article</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #999999; font-size: 14px;">
                Published on ${new Date(data.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 13px; line-height: 1.5;">
                You're receiving this email because you subscribed to our newsletter.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #5B2C91; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Generate custom announcement HTML email
export function generateCustomEmail(data: CustomEmailData, unsubscribeToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`

  if (data.htmlContent) {
    // Use custom HTML but append unsubscribe link
    return `
${data.htmlContent}
<div style="margin-top: 40px; padding: 20px; background-color: #f8f8f8; border-top: 1px solid #e0e0e0; text-align: center;">
  <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
    You're receiving this email because you subscribed to our newsletter.
  </p>
  <p style="margin: 0; color: #999999; font-size: 12px;">
    <a href="${unsubscribeUrl}" style="color: #5B2C91; text-decoration: underline;">Unsubscribe</a>
  </p>
</div>
    `.trim()
  }

  // Generate simple HTML from plain text content
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #5B2C91 0%, #7B3FB2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${escapeHtml(data.subject)}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="color: #2A2A2A; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.content)}</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 13px; line-height: 1.5;">
                You're receiving this email because you subscribed to our newsletter.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #5B2C91; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Send newsletter email to a single subscriber
export async function sendNewsletterEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const transporter = createNewsletterTransporter()

  await transporter.sendMail({
    from: `"${process.env.NEWSLETTER_FROM_NAME || 'Newsletter'}" <${process.env.NEWSLETTER_EMAIL}>`,
    to,
    subject,
    html
  })
}

// Send newsletter to all active subscribers
export async function sendBulkNewsletter(
  subject: string,
  generateHtmlFn: (unsubscribeToken: string) => string,
  subscribers: Array<{ email: string; unsubscribeToken: string }>
): Promise<{ sent: number; failed: number; errors: Array<{ email: string; error: string }> }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>
  }

  // Send emails sequentially to avoid rate limiting (Gmail limit: 500/day)
  for (const subscriber of subscribers) {
    try {
      const html = generateHtmlFn(subscriber.unsubscribeToken)
      await sendNewsletterEmail(subscriber.email, subject, html)
      results.sent++

      // Small delay to avoid rate limiting (120ms = max 500 emails/hour)
      await new Promise(resolve => setTimeout(resolve, 120))
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.email}:`, error)
      results.failed++
      results.errors.push({
        email: subscriber.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}
