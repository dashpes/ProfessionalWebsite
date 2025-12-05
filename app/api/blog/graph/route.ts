import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { calculateTagConnections, GraphNode, GraphLink, GraphData } from '@/lib/graph-utils'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    // Fetch all published posts with their categories, tags, and backlinks
    const posts = await db.blogPost.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        outgoingLinks: {
          include: {
            targetPost: {
              select: {
                id: true,
                slug: true,
                status: true
              }
            }
          }
        },
        incomingLinks: {
          include: {
            sourcePost: {
              select: {
                id: true,
                slug: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    // Fetch all categories and tags with post counts
    const [categories, tags] = await Promise.all([
      db.blogCategory.findMany({
        include: {
          _count: {
            select: { posts: true }
          }
        }
      }),
      db.blogTag.findMany({
        include: {
          _count: {
            select: { posts: true }
          }
        }
      })
    ])

    // Transform posts to graph nodes
    const nodes: GraphNode[] = posts.map(post => {
      // Get first category if exists
      const firstCategory = post.categories[0]?.category

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        viewCount: post.viewCount,
        categoryId: firstCategory?.id || null,
        categoryName: firstCategory?.name || null,
        categoryColor: firstCategory?.color || null,
        tagIds: post.tags.map(t => t.tag.id),
        tagNames: post.tags.map(t => t.tag.name),
        publishedAt: post.publishedAt?.toISOString() || null
      }
    })

    // Calculate tag-based connections
    const tagLinks = calculateTagConnections(nodes)

    // Get backlink connections (only between published posts)
    const backlinkLinks: GraphLink[] = []
    const publishedPostIds = new Set(posts.map(p => p.id))

    for (const post of posts) {
      for (const link of post.outgoingLinks) {
        // Only include links to published posts
        if (link.targetPost.status === 'PUBLISHED' && publishedPostIds.has(link.targetPost.id)) {
          backlinkLinks.push({
            source: post.id,
            target: link.targetPost.id,
            type: 'backlink',
            strength: 1
          })
        }
      }
    }

    // Combine all links
    const allLinks = [...tagLinks, ...backlinkLinks]

    // Build response
    const graphData: GraphData = {
      nodes,
      links: allLinks,
      metadata: {
        totalNodes: nodes.length,
        totalLinks: allLinks.length,
        tags: tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          postCount: tag._count.posts
        })),
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          postCount: cat._count.posts
        }))
      }
    }

    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Failed to fetch graph data:', error)
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 })
  }
}
