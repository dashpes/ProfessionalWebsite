import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database module
vi.mock('@/lib/database', () => ({
  db: {
    blogCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    blogTag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  logAdminActivity: vi.fn(),
  getClientIP: vi.fn(() => '127.0.0.1'),
}))

// Mock auth module
vi.mock('@/lib/auth', () => ({
  verifyAdminToken: vi.fn(),
}))

describe('Blog Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/blog/categories', () => {
    it('should return all categories', async () => {
      const { db } = await import('@/lib/database')
      const mockCategories = [
        { id: '1', name: 'Technology', slug: 'technology', description: null, color: null },
        { id: '2', name: 'Design', slug: 'design', description: null, color: '#ff0000' },
      ]

      vi.mocked(db.blogCategory.findMany).mockResolvedValue(mockCategories as never)

      const { GET } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCategories)
    })

    it('should include post count when requested', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogCategory.findMany).mockResolvedValue([])

      const { GET } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories?count=true')
      await GET(request)

      expect(db.blogCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.anything(),
          }),
        })
      )
    })

    it('should return 500 on error', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogCategory.findMany).mockRejectedValue(new Error('DB error'))

      const { GET } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/blog/categories', () => {
    beforeEach(async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: true, admin: true })
    })

    it('should require authentication', async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: false })

      const { POST } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Category' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should require category name', async () => {
      const { POST } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should create a new category', async () => {
      const { db } = await import('@/lib/database')
      const mockCategory = {
        id: '1',
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
        color: '#ff0000',
      }

      vi.mocked(db.blogCategory.findUnique).mockResolvedValue(null)
      vi.mocked(db.blogCategory.create).mockResolvedValue(mockCategory as never)

      const { POST } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Category',
          description: 'A new category',
          color: '#ff0000',
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.name).toBe('New Category')
    })

    it('should generate unique slug for duplicate names', async () => {
      const { db } = await import('@/lib/database')
      const existingCategory = { id: '1', slug: 'technology' }

      vi.mocked(db.blogCategory.findUnique).mockResolvedValue(existingCategory as never)
      vi.mocked(db.blogCategory.create).mockResolvedValue({
        id: '2',
        name: 'Technology',
        slug: 'technology-123456789',
      } as never)

      const { POST } = await import('@/app/api/blog/categories/route')
      const request = new NextRequest('http://localhost/api/blog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Technology' }),
      })

      await POST(request)

      expect(db.blogCategory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: expect.stringMatching(/^technology-\d+$/),
          }),
        })
      )
    })
  })
})

describe('Blog Tags API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/blog/tags', () => {
    it('should return all tags', async () => {
      const { db } = await import('@/lib/database')
      const mockTags = [
        { id: '1', name: 'JavaScript', slug: 'javascript' },
        { id: '2', name: 'React', slug: 'react' },
      ]

      vi.mocked(db.blogTag.findMany).mockResolvedValue(mockTags as never)

      const { GET } = await import('@/app/api/blog/tags/route')
      const request = new NextRequest('http://localhost/api/blog/tags')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTags)
    })

    it('should include post count when requested', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogTag.findMany).mockResolvedValue([])

      const { GET } = await import('@/app/api/blog/tags/route')
      const request = new NextRequest('http://localhost/api/blog/tags?count=true')
      await GET(request)

      expect(db.blogTag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.anything(),
          }),
        })
      )
    })
  })

  describe('POST /api/blog/tags', () => {
    beforeEach(async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: true, admin: true })
    })

    it('should require authentication', async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: false })

      const { POST } = await import('@/app/api/blog/tags/route')
      const request = new NextRequest('http://localhost/api/blog/tags', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Tag' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should require tag name', async () => {
      const { POST } = await import('@/app/api/blog/tags/route')
      const request = new NextRequest('http://localhost/api/blog/tags', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should create a new tag', async () => {
      const { db } = await import('@/lib/database')
      const mockTag = {
        id: '1',
        name: 'New Tag',
        slug: 'new-tag',
      }

      vi.mocked(db.blogTag.findUnique).mockResolvedValue(null)
      vi.mocked(db.blogTag.create).mockResolvedValue(mockTag as never)

      const { POST } = await import('@/app/api/blog/tags/route')
      const request = new NextRequest('http://localhost/api/blog/tags', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Tag' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.name).toBe('New Tag')
    })
  })
})
