import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock nodemailer and resend
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    })),
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-id' }),
    },
  })),
}))

describe('Contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Set required env vars
    vi.stubEnv('CONTACT_EMAIL', 'contact@example.com')
  })

  describe('POST /api/contact', () => {
    const validPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.',
    }

    it('should return 400 if name is missing', async () => {
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, name: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('All fields are required')
    })

    it('should return 400 if email is missing', async () => {
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, email: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('All fields are required')
    })

    it('should return 400 if subject is missing', async () => {
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, subject: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('All fields are required')
    })

    it('should return 400 if message is missing', async () => {
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, message: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('All fields are required')
    })

    it('should return 400 for invalid email format', async () => {
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, email: 'invalid-email' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid email address')
    })

    it('should return 500 if CONTACT_EMAIL not set', async () => {
      vi.stubEnv('CONTACT_EMAIL', '')

      // Need to reimport after changing env
      vi.resetModules()
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Server configuration error')
    })

    it('should return success for valid submission', async () => {
      vi.stubEnv('GMAIL_USER', 'test@gmail.com')
      vi.stubEnv('GMAIL_APP_PASSWORD', 'test-password')

      vi.resetModules()
      const { POST } = await import('@/app/api/contact/route')
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.message).toContain('Message')
    })
  })
})

describe('HTML Escape Function', () => {
  // Test the escapeHtml logic
  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less than signs', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('should escape greater than signs', () => {
    expect(escapeHtml('1 > 0')).toBe('1 &gt; 0')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s')
  })

  it('should escape multiple characters', () => {
    const input = '<script>alert("xss")</script>'
    const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    expect(escapeHtml(input)).toBe(expected)
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should handle string with no special chars', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})
