import { describe, it, expect } from 'vitest'
import { NextResponse } from 'next/server'

describe('API Response Patterns', () => {
  describe('Success Responses', () => {
    it('should return 200 for successful GET requests', () => {
      const response = NextResponse.json({ data: 'test' })
      expect(response.status).toBe(200)
    })

    it('should return 201 for successful creation', () => {
      const response = NextResponse.json({ id: '123' }, { status: 201 })
      expect(response.status).toBe(201)
    })

    it('should include success flag in response body', async () => {
      const response = NextResponse.json({ success: true, data: 'test' })
      const body = await response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('Error Responses', () => {
    it('should return 400 for bad requests', () => {
      const response = NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
      expect(response.status).toBe(400)
    })

    it('should return 401 for unauthorized requests', () => {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      expect(response.status).toBe(401)
    })

    it('should return 404 for not found', () => {
      const response = NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
      expect(response.status).toBe(404)
    })

    it('should return 500 for server errors', () => {
      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      expect(response.status).toBe(500)
    })

    it('should include error message in response body', async () => {
      const response = NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      )
      const body = await response.json()
      expect(body.error).toBe('Something went wrong')
    })
  })

  describe('Cache Headers', () => {
    it('should include cache control for public data', () => {
      const response = NextResponse.json({ data: 'test' }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60'
        }
      })
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=60')
    })

    it('should disable cache for authenticated endpoints', () => {
      const response = NextResponse.json({ data: 'test' }, {
        headers: {
          'Cache-Control': 'no-store'
        }
      })
      expect(response.headers.get('Cache-Control')).toBe('no-store')
    })
  })

  describe('Pagination Response Format', () => {
    interface PaginationInfo {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }

    function createPagination(page: number, limit: number, total: number): PaginationInfo {
      const totalPages = Math.ceil(total / limit)
      return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    it('should have correct pagination structure', () => {
      const pagination = createPagination(1, 10, 100)

      expect(pagination).toHaveProperty('page')
      expect(pagination).toHaveProperty('limit')
      expect(pagination).toHaveProperty('total')
      expect(pagination).toHaveProperty('totalPages')
      expect(pagination).toHaveProperty('hasNext')
      expect(pagination).toHaveProperty('hasPrev')
    })

    it('should calculate totalPages correctly', () => {
      expect(createPagination(1, 10, 100).totalPages).toBe(10)
      expect(createPagination(1, 10, 95).totalPages).toBe(10)
      expect(createPagination(1, 10, 5).totalPages).toBe(1)
      expect(createPagination(1, 10, 0).totalPages).toBe(0)
    })

    it('should calculate hasNext correctly', () => {
      expect(createPagination(1, 10, 100).hasNext).toBe(true)
      expect(createPagination(5, 10, 100).hasNext).toBe(true)
      expect(createPagination(10, 10, 100).hasNext).toBe(false)
    })

    it('should calculate hasPrev correctly', () => {
      expect(createPagination(1, 10, 100).hasPrev).toBe(false)
      expect(createPagination(2, 10, 100).hasPrev).toBe(true)
      expect(createPagination(10, 10, 100).hasPrev).toBe(true)
    })
  })

  describe('List Response Format', () => {
    it('should return items array with metadata', async () => {
      const mockData = {
        items: [{ id: '1' }, { id: '2' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 2
        }
      }

      const response = NextResponse.json(mockData)
      const body = await response.json()

      expect(Array.isArray(body.items)).toBe(true)
      expect(body.pagination).toBeDefined()
    })
  })

  describe('Single Item Response Format', () => {
    it('should return item directly for single resource', async () => {
      const mockItem = {
        id: '123',
        title: 'Test Item',
        createdAt: new Date().toISOString()
      }

      const response = NextResponse.json(mockItem)
      const body = await response.json()

      expect(body.id).toBe('123')
      expect(body.title).toBe('Test Item')
    })
  })
})
