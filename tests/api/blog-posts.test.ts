import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database module
vi.mock('@/lib/database', () => ({
  db: {
    blogPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    blogCategory: {
      upsert: vi.fn(),
    },
    blogTag: {
      upsert: vi.fn(),
    },
    blogPostCategory: {
      create: vi.fn(),
    },
    blogPostTag: {
      create: vi.fn(),
    },
    blogPostLink: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    adminActivity: {
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

// Mock backlink parser
vi.mock('@/lib/backlink-parser', () => ({
  extractBacklinks: vi.fn(() => []),
}))

describe('Blog Posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/blog/posts', () => {
    it('should return published posts for public requests', async () => {
      const { db } = await import('@/lib/database')
      const mockPosts = [
        {
          id: '1',
          slug: 'test-post',
          title: 'Test Post',
          status: 'PUBLISHED',
          categories: [],
          tags: [],
        },
      ]

      vi.mocked(db.blogPost.findMany).mockResolvedValue(mockPosts as never)
      vi.mocked(db.blogPost.count).mockResolvedValue(1)

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.posts).toEqual(mockPosts)
      expect(data.pagination).toBeDefined()
    })

    it('should filter by category', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogPost.findMany).mockResolvedValue([])
      vi.mocked(db.blogPost.count).mockResolvedValue(0)

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts?category=tech')
      await GET(request)

      expect(db.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: {
              some: {
                category: {
                  slug: 'tech',
                },
              },
            },
          }),
        })
      )
    })

    it('should filter by tag', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogPost.findMany).mockResolvedValue([])
      vi.mocked(db.blogPost.count).mockResolvedValue(0)

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts?tag=javascript')
      await GET(request)

      expect(db.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: {
              some: {
                tag: {
                  slug: 'javascript',
                },
              },
            },
          }),
        })
      )
    })

    it('should search posts', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogPost.findMany).mockResolvedValue([])
      vi.mocked(db.blogPost.count).mockResolvedValue(0)

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts?search=react')
      await GET(request)

      expect(db.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'react', mode: 'insensitive' } },
            ]),
          }),
        })
      )
    })

    it('should paginate results', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogPost.findMany).mockResolvedValue([])
      vi.mocked(db.blogPost.count).mockResolvedValue(50)

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts?page=2&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(50)
      expect(data.pagination.totalPages).toBe(5)
      expect(data.pagination.hasNext).toBe(true)
      expect(data.pagination.hasPrev).toBe(true)
    })

    it('should require auth for admin requests', async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: false })

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts?admin=true')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should return 500 on database error', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogPost.findMany).mockRejectedValue(new Error('DB error'))

      const { GET } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/blog/posts', () => {
    beforeEach(async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: true, admin: true })
    })

    it('should require authentication', async () => {
      const { verifyAdminToken } = await import('@/lib/auth')
      vi.mocked(verifyAdminToken).mockReturnValue({ valid: false })

      const { POST } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', content: 'Content' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should require title and content', async () => {
      const { POST } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts', {
        method: 'POST',
        body: JSON.stringify({ title: '' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should create a new blog post', async () => {
      const { db } = await import('@/lib/database')
      const mockPost = {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        content: 'Test content',
        status: 'DRAFT',
        categories: [],
        tags: [],
      }

      vi.mocked(db.blogPost.findUnique).mockResolvedValue(null)
      vi.mocked(db.blogPost.create).mockResolvedValue(mockPost as never)
      vi.mocked(db.blogPost.findUnique).mockResolvedValue(mockPost as never)

      const { POST } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Test content',
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should generate unique slug for duplicate titles', async () => {
      const { db } = await import('@/lib/database')
      const existingPost = { id: '1', slug: 'test-post' }

      // First call returns existing post, second call for unique check
      vi.mocked(db.blogPost.findUnique)
        .mockResolvedValueOnce(existingPost as never)
        .mockResolvedValueOnce(null)

      vi.mocked(db.blogPost.create).mockResolvedValue({
        id: '2',
        slug: 'test-post-123456789',
        categories: [],
        tags: [],
      } as never)

      const { POST } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Test content',
        }),
      })

      await POST(request)

      expect(db.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: expect.stringMatching(/^test-post-\d+$/),
          }),
        })
      )
    })

    it('should default status to DRAFT', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.blogPost.findUnique).mockResolvedValue(null)
      vi.mocked(db.blogPost.create).mockResolvedValue({
        id: '1',
        slug: 'test',
        categories: [],
        tags: [],
      } as never)

      const { POST } = await import('@/app/api/blog/posts/route')
      const request = new NextRequest('http://localhost/api/blog/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test',
          content: 'Content',
        }),
      })

      await POST(request)

      expect(db.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      )
    })
  })
})
