import { describe, it, expect } from 'vitest'

// Import types and functions
interface GraphNode {
  id: string
  slug: string
  title: string
  excerpt: string | null
  viewCount: number
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
  tagIds: string[]
  tagNames: string[]
  publishedAt: string | null
  isProject?: boolean
}

interface GraphLink {
  source: string
  target: string
  type: 'tag' | 'backlink'
  strength: number
  sharedTags?: string[]
}

function calculateTagConnections(nodes: GraphNode[]): GraphLink[] {
  const links: Map<string, GraphLink> = new Map()

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i]
      const nodeB = nodes[j]

      const aNamesLower = nodeA.tagNames.map(n => n.toLowerCase())
      const bNamesLower = nodeB.tagNames.map(n => n.toLowerCase())

      const sharedNamesLower = aNamesLower.filter(name => bNamesLower.includes(name))

      if (sharedNamesLower.length > 0) {
        const sharedTagNames = nodeA.tagNames.filter(name =>
          bNamesLower.includes(name.toLowerCase())
        )

        const key = [nodeA.id, nodeB.id].sort().join('-')
        links.set(key, {
          source: nodeA.id,
          target: nodeB.id,
          type: 'tag',
          strength: sharedNamesLower.length,
          sharedTags: sharedTagNames
        })
      }
    }
  }

  return Array.from(links.values())
}

function getNodeSize(viewCount: number): number {
  const minSize = 4
  const maxSize = 20
  const logScale = Math.log10(viewCount + 1)
  return Math.min(maxSize, minSize + logScale * 4)
}

function getNodeColor(categoryColor: string | null): string {
  return categoryColor || '#8884d8'
}

function getLinkColor(linkType: 'tag' | 'backlink'): string {
  return linkType === 'backlink' ? '#ff7300' : '#82ca9d'
}

function getLinkWidth(strength: number): number {
  return Math.min(1 + strength * 0.5, 4)
}

describe('Graph Utils', () => {
  describe('calculateTagConnections', () => {
    const createNode = (id: string, tagNames: string[]): GraphNode => ({
      id,
      slug: id,
      title: `Node ${id}`,
      excerpt: null,
      viewCount: 100,
      categoryId: null,
      categoryName: null,
      categoryColor: null,
      tagIds: tagNames.map((_, i) => `tag-${i}`),
      tagNames,
      publishedAt: null,
    })

    it('should find connections between nodes with shared tags', () => {
      const nodes = [
        createNode('1', ['React', 'TypeScript']),
        createNode('2', ['TypeScript', 'Node.js']),
      ]

      const links = calculateTagConnections(nodes)

      expect(links).toHaveLength(1)
      expect(links[0].source).toBe('1')
      expect(links[0].target).toBe('2')
      expect(links[0].type).toBe('tag')
      expect(links[0].strength).toBe(1)
      expect(links[0].sharedTags).toContain('TypeScript')
    })

    it('should return empty array when no shared tags', () => {
      const nodes = [
        createNode('1', ['React']),
        createNode('2', ['Vue']),
      ]

      const links = calculateTagConnections(nodes)

      expect(links).toHaveLength(0)
    })

    it('should count multiple shared tags in strength', () => {
      const nodes = [
        createNode('1', ['React', 'TypeScript', 'Node.js']),
        createNode('2', ['TypeScript', 'Node.js', 'Express']),
      ]

      const links = calculateTagConnections(nodes)

      expect(links).toHaveLength(1)
      expect(links[0].strength).toBe(2)
      expect(links[0].sharedTags).toEqual(['TypeScript', 'Node.js'])
    })

    it('should be case-insensitive', () => {
      const nodes = [
        createNode('1', ['REACT', 'typescript']),
        createNode('2', ['react', 'TYPESCRIPT']),
      ]

      const links = calculateTagConnections(nodes)

      expect(links).toHaveLength(1)
      expect(links[0].strength).toBe(2)
    })

    it('should connect multiple nodes', () => {
      const nodes = [
        createNode('1', ['React']),
        createNode('2', ['React', 'Vue']),
        createNode('3', ['Vue']),
      ]

      const links = calculateTagConnections(nodes)

      expect(links).toHaveLength(2) // 1-2 and 2-3
    })

    it('should not duplicate links', () => {
      const nodes = [
        createNode('1', ['React', 'React']), // Duplicate tag
        createNode('2', ['React']),
      ]

      const links = calculateTagConnections(nodes)

      expect(links).toHaveLength(1)
    })

    it('should handle empty nodes array', () => {
      const links = calculateTagConnections([])
      expect(links).toHaveLength(0)
    })

    it('should handle single node', () => {
      const nodes = [createNode('1', ['React'])]
      const links = calculateTagConnections(nodes)
      expect(links).toHaveLength(0)
    })
  })

  describe('getNodeSize', () => {
    it('should return minimum size for zero views', () => {
      const size = getNodeSize(0)
      expect(size).toBeCloseTo(4, 1)
    })

    it('should increase size with more views', () => {
      const size0 = getNodeSize(0)
      const size10 = getNodeSize(10)
      const size100 = getNodeSize(100)
      const size1000 = getNodeSize(1000)

      expect(size10).toBeGreaterThan(size0)
      expect(size100).toBeGreaterThan(size10)
      expect(size1000).toBeGreaterThan(size100)
    })

    it('should cap at maximum size', () => {
      const sizeHuge = getNodeSize(1000000)
      expect(sizeHuge).toBeLessThanOrEqual(20)
    })

    it('should use logarithmic scale', () => {
      // Log10(10) = 1, Log10(100) = 2, Log10(1000) = 3
      // So increases should be consistent (additive in log scale)
      const diff1 = getNodeSize(100) - getNodeSize(10)
      const diff2 = getNodeSize(1000) - getNodeSize(100)
      const diff3 = getNodeSize(10000) - getNodeSize(1000)

      // Each diff should be roughly equal (within 0.5)
      expect(Math.abs(diff1 - diff2)).toBeLessThan(0.5)
      expect(Math.abs(diff2 - diff3)).toBeLessThan(0.5)
    })
  })

  describe('getNodeColor', () => {
    it('should return category color when provided', () => {
      expect(getNodeColor('#ff0000')).toBe('#ff0000')
      expect(getNodeColor('#00ff00')).toBe('#00ff00')
    })

    it('should return default color when null', () => {
      expect(getNodeColor(null)).toBe('#8884d8')
    })
  })

  describe('getLinkColor', () => {
    it('should return orange for backlinks', () => {
      expect(getLinkColor('backlink')).toBe('#ff7300')
    })

    it('should return green for tag links', () => {
      expect(getLinkColor('tag')).toBe('#82ca9d')
    })
  })

  describe('getLinkWidth', () => {
    it('should return base width for strength 0', () => {
      expect(getLinkWidth(0)).toBe(1)
    })

    it('should increase with strength', () => {
      expect(getLinkWidth(2)).toBe(2)
      expect(getLinkWidth(4)).toBe(3)
    })

    it('should cap at maximum width', () => {
      expect(getLinkWidth(100)).toBe(4)
    })
  })
})
