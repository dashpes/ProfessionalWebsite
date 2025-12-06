import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}))

describe('Admin Login API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('POST /api/admin/login', () => {
    it('should return 400 if password is missing', async () => {
      const { POST } = await import('@/app/api/admin/login/route')
      const request = new NextRequest('http://localhost/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Password is required')
    })

    it('should return 401 for invalid password', async () => {
      const { POST } = await import('@/app/api/admin/login/route')
      const request = new NextRequest('http://localhost/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'wrong-password' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Invalid password')
    })

    it('should return token for valid password', async () => {
      vi.mocked(jwt.sign).mockReturnValue('test-token' as never)

      const { POST } = await import('@/app/api/admin/login/route')
      const request = new NextRequest('http://localhost/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'admin123' }), // Default password
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.token).toBe('test-token')
    })

    it('should sign JWT with correct payload', async () => {
      vi.mocked(jwt.sign).mockReturnValue('test-token' as never)

      const { POST } = await import('@/app/api/admin/login/route')
      const request = new NextRequest('http://localhost/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'admin123' }),
      })

      await POST(request)

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ admin: true }),
        expect.any(String),
        { expiresIn: '24h' }
      )
    })

    it('should return 500 on internal error', async () => {
      const { POST } = await import('@/app/api/admin/login/route')
      const request = new NextRequest('http://localhost/api/admin/login', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })
})

describe('Admin Verify API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('GET /api/admin/verify', () => {
    it('should return 401 if no token provided', async () => {
      const { GET } = await import('@/app/api/admin/verify/route')
      const request = new NextRequest('http://localhost/api/admin/verify')

      const response = await GET(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('No token provided')
    })

    it('should return 401 for invalid token', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const { GET } = await import('@/app/api/admin/verify/route')
      const request = new NextRequest('http://localhost/api/admin/verify', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Invalid token')
    })

    it('should return 401 if token has no admin claim', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ admin: false } as never)

      const { GET } = await import('@/app/api/admin/verify/route')
      const request = new NextRequest('http://localhost/api/admin/verify', {
        headers: {
          authorization: 'Bearer some-token',
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Invalid token')
    })

    it('should return valid true for valid admin token', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ admin: true } as never)

      const { GET } = await import('@/app/api/admin/verify/route')
      const request = new NextRequest('http://localhost/api/admin/verify', {
        headers: {
          authorization: 'Bearer valid-admin-token',
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.valid).toBe(true)
    })

    it('should strip Bearer prefix from token', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ admin: true } as never)

      const { GET } = await import('@/app/api/admin/verify/route')
      const request = new NextRequest('http://localhost/api/admin/verify', {
        headers: {
          authorization: 'Bearer my-token',
        },
      })

      await GET(request)

      expect(jwt.verify).toHaveBeenCalledWith('my-token', expect.any(String))
    })
  })
})
