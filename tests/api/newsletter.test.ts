import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database module
vi.mock('@/lib/database', () => ({
  db: {
    subscriber: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('Newsletter Subscribe API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('POST /api/newsletter/subscribe', () => {
    it('should return 400 if email is missing', async () => {
      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Email is required')
    })

    it('should return 400 for invalid email format', async () => {
      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid-email' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid email format')
    })

    it('should return 400 if already subscribed', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.subscriber.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        subscribed: true,
      } as never)

      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('This email is already subscribed')
    })

    it('should re-subscribe previously unsubscribed user', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.subscriber.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        subscribed: false,
      } as never)
      vi.mocked(db.subscriber.update).mockResolvedValue({} as never)

      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.message).toBe('Successfully re-subscribed to newsletter')
      expect(data.success).toBe(true)
    })

    it('should create new subscriber', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.subscriber.findUnique).mockResolvedValue(null)
      vi.mocked(db.subscriber.create).mockResolvedValue({} as never)

      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'new@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.message).toBe('Successfully subscribed to newsletter')
      expect(data.success).toBe(true)
    })

    it('should lowercase email before saving', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.subscriber.findUnique).mockResolvedValue(null)
      vi.mocked(db.subscriber.create).mockResolvedValue({} as never)

      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'TEST@EXAMPLE.COM' }),
      })

      await POST(request)

      expect(db.subscriber.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })

    it('should return 500 on database error', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.subscriber.findUnique).mockRejectedValue(new Error('DB error'))

      const { POST } = await import('@/app/api/newsletter/subscribe/route')
      const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Failed to subscribe')
    })

    it('should validate various email formats', async () => {
      const { POST } = await import('@/app/api/newsletter/subscribe/route')

      // Test invalid emails
      const invalidEmails = [
        'plaintext',
        '@missinglocal.com',
        'missing@.com',
        'missing@domain.',
        'spaces in@email.com',
      ]

      for (const email of invalidEmails) {
        const request = new NextRequest('http://localhost/api/newsletter/subscribe', {
          method: 'POST',
          body: JSON.stringify({ email }),
        })
        const response = await POST(request)
        expect(response.status).toBe(400)
      }
    })
  })
})
