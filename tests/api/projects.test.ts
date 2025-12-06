import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the database module
vi.mock('@/lib/database', () => ({
  db: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/projects', () => {
    it('should return active projects', async () => {
      const { db } = await import('@/lib/database')
      const mockProjects = [
        {
          id: '1',
          name: 'project-1',
          title: 'Project 1',
          description: 'Description 1',
          githubUrl: 'https://github.com/user/repo',
          liveUrl: null,
          featured: true,
          status: 'ACTIVE',
          source: 'GITHUB',
          imageUrl: null,
          imageUrlOverride: null,
          titleOverride: null,
          descriptionOverride: null,
          category: 'web',
          displayOrder: 1,
          starsCount: 100,
          forksCount: 10,
          primaryLanguage: 'TypeScript',
          repoSize: 1000,
          technologies: [
            {
              technology: { name: 'React' },
              percentage: 80,
            },
          ],
        },
      ]

      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as never)

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0]).toEqual({
        id: '1',
        title: 'Project 1',
        description: 'Description 1',
        technologies: ['React'],
        github: 'https://github.com/user/repo',
        live: null,
        featured: true,
        manual: false,
        status: 'active',
        image: null,
        category: 'web',
        order: 1,
        stars: 100,
        forks: 10,
        language: 'TypeScript',
        size: 1000,
      })
    })

    it('should use title override when available', async () => {
      const { db } = await import('@/lib/database')
      const mockProjects = [
        {
          id: '1',
          name: 'project-1',
          title: 'Original Title',
          titleOverride: 'Override Title',
          description: 'Description',
          descriptionOverride: null,
          imageUrl: null,
          imageUrlOverride: null,
          githubUrl: null,
          liveUrl: null,
          featured: false,
          status: 'ACTIVE',
          source: 'MANUAL',
          category: null,
          displayOrder: 1,
          starsCount: 0,
          forksCount: 0,
          primaryLanguage: null,
          repoSize: null,
          technologies: [],
        },
      ]

      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as never)

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()
      const data = await response.json()

      expect(data[0].title).toBe('Override Title')
    })

    it('should use description override when available', async () => {
      const { db } = await import('@/lib/database')
      const mockProjects = [
        {
          id: '1',
          name: 'project-1',
          title: 'Title',
          titleOverride: null,
          description: 'Original Description',
          descriptionOverride: 'Override Description',
          imageUrl: null,
          imageUrlOverride: null,
          githubUrl: null,
          liveUrl: null,
          featured: false,
          status: 'ACTIVE',
          source: 'MANUAL',
          category: null,
          displayOrder: 1,
          starsCount: 0,
          forksCount: 0,
          primaryLanguage: null,
          repoSize: null,
          technologies: [],
        },
      ]

      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as never)

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()
      const data = await response.json()

      expect(data[0].description).toBe('Override Description')
    })

    it('should fallback to default description when none available', async () => {
      const { db } = await import('@/lib/database')
      const mockProjects = [
        {
          id: '1',
          name: 'project-1',
          title: 'Title',
          titleOverride: null,
          description: null,
          descriptionOverride: null,
          imageUrl: null,
          imageUrlOverride: null,
          githubUrl: null,
          liveUrl: null,
          featured: false,
          status: 'ACTIVE',
          source: 'MANUAL',
          category: null,
          displayOrder: 1,
          starsCount: 0,
          forksCount: 0,
          primaryLanguage: null,
          repoSize: null,
          technologies: [],
        },
      ]

      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as never)

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()
      const data = await response.json()

      expect(data[0].description).toBe('No description available')
    })

    it('should identify manual projects', async () => {
      const { db } = await import('@/lib/database')
      const mockProjects = [
        {
          id: '1',
          name: 'manual-project',
          title: 'Manual Project',
          titleOverride: null,
          description: 'Description',
          descriptionOverride: null,
          imageUrl: null,
          imageUrlOverride: null,
          githubUrl: null,
          liveUrl: null,
          featured: false,
          status: 'ACTIVE',
          source: 'MANUAL',
          category: null,
          displayOrder: 1,
          starsCount: 0,
          forksCount: 0,
          primaryLanguage: null,
          repoSize: null,
          technologies: [],
        },
      ]

      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as never)

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()
      const data = await response.json()

      expect(data[0].manual).toBe(true)
    })

    it('should return empty array on error', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.project.findMany).mockRejectedValue(new Error('DB error'))

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual([])
    })

    it('should set cache headers', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.project.findMany).mockResolvedValue([])

      const { GET } = await import('@/app/api/projects/route')
      const response = await GET()

      expect(response.headers.get('Cache-Control')).toContain('s-maxage=60')
    })
  })
})

describe('Featured Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/projects/featured', () => {
    it('should return only featured active projects', async () => {
      const { db } = await import('@/lib/database')
      const mockProjects = [
        {
          id: '1',
          name: 'featured-project',
          title: 'Featured Project',
          description: 'Description',
          githubUrl: 'https://github.com/user/repo',
          liveUrl: null,
          featured: true,
          status: 'ACTIVE',
          source: 'GITHUB',
          imageUrl: 'https://example.com/image.png',
          category: 'web',
          displayOrder: 1,
          starsCount: 500,
          forksCount: 50,
          primaryLanguage: 'TypeScript',
          technologies: [],
        },
      ]

      vi.mocked(db.project.findMany).mockResolvedValue(mockProjects as never)

      const { GET } = await import('@/app/api/projects/featured/route')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].featured).toBe(true)
    })

    it('should limit to 6 projects', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.project.findMany).mockResolvedValue([])

      const { GET } = await import('@/app/api/projects/featured/route')
      await GET()

      expect(db.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 6,
        })
      )
    })

    it('should have longer cache duration than regular projects', async () => {
      const { db } = await import('@/lib/database')
      vi.mocked(db.project.findMany).mockResolvedValue([])

      const { GET } = await import('@/app/api/projects/featured/route')
      const response = await GET()

      expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600')
    })
  })
})
