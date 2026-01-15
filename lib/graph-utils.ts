/**
 * Graph Utilities for Blog Visualization
 * Transforms blog data into graph nodes and links
 */

export interface ProjectData {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  githubUrl: string | null
  liveUrl: string | null
  category: string | null
  starsCount: number
  forksCount: number
  primaryLanguage: string | null
  viewCount: number
  likeCount: number
  technologyNames: string[]
}

export interface DocumentData {
  id: string
  title: string
  excerpt: string | null
  fileUrl: string
  fileName: string
  coverImage: string | null
  viewCount: number
}

export interface GraphNode {
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
  projectData?: ProjectData
  isDocument?: boolean
  documentData?: DocumentData
}

export interface GraphLink {
  source: string
  target: string
  type: 'tag' | 'backlink'
  strength: number
  sharedTags?: string[]
}

export interface TagInfo {
  id: string
  name: string
  slug: string
  postCount: number
}

export interface CategoryInfo {
  id: string
  name: string
  slug: string
  color: string | null
  postCount: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  metadata: {
    totalNodes: number
    totalLinks: number
    tags: TagInfo[]
    categories: CategoryInfo[]
  }
}

/**
 * Calculate tag-based connections between posts and projects
 * Nodes are connected if they share one or more tags/technologies
 * Uses case-insensitive matching to connect projects (technologies) with blog posts (tags)
 */
export function calculateTagConnections(nodes: GraphNode[]): GraphLink[] {
  const links: Map<string, GraphLink> = new Map()

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i]
      const nodeB = nodes[j]

      // Use case-insensitive matching for cross-type connections (projects <-> blog posts)
      const aNamesLower = nodeA.tagNames.map(n => n.toLowerCase())
      const bNamesLower = nodeB.tagNames.map(n => n.toLowerCase())

      const sharedNamesLower = aNamesLower.filter(name => bNamesLower.includes(name))

      if (sharedNamesLower.length > 0) {
        // Get original case tag names for display
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

/**
 * Get node size based on view count (logarithmic scale)
 */
export function getNodeSize(viewCount: number): number {
  const minSize = 4
  const maxSize = 20
  const logScale = Math.log10(viewCount + 1)
  return Math.min(maxSize, minSize + logScale * 4)
}

/**
 * Get node color based on category
 */
export function getNodeColor(categoryColor: string | null): string {
  return categoryColor || '#8884d8' // Default purple
}

/**
 * Get link color based on type
 */
export function getLinkColor(linkType: 'tag' | 'backlink'): string {
  return linkType === 'backlink' ? '#ff7300' : '#82ca9d'
}

/**
 * Get link width based on strength
 */
export function getLinkWidth(strength: number): number {
  return Math.min(1 + strength * 0.5, 4)
}
