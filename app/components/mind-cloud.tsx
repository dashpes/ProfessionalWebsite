'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
  Simulation
} from 'd3-force'
import { ArrowLeft, Heart, Share2, Calendar, Clock } from 'lucide-react'
import 'highlight.js/styles/vs2015.css'

interface GraphNode extends SimulationNodeDatum {
  id: string
  slug?: string
  label: string
  type: 'center' | 'topic' | 'post'
  color: string
  size: number
  // Explicitly include d3-force properties
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  strength: number
}

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  publishedAt: string
  readingTimeMinutes: number
  viewCount: number
  category?: { name: string; color: string }
  tags?: { id: string; name: string }[]
}

interface MindCloudProps {
  className?: string
}

export function MindCloud({ className = '' }: MindCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Side panel state
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [postLoading, setPostLoading] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Category list state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryPosts, setCategoryPosts] = useState<BlogPost[]>([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  // Open post in side panel
  const openPost = async (slug: string) => {
    setSelectedCategory(null) // Clear category view
    setCategoryPosts([])
    setPostLoading(true)
    setIsPanelOpen(true)

    try {
      const res = await fetch(`/api/blog/posts/${slug}`)
      if (res.ok) {
        const post = await res.json()
        setSelectedPost(post)
      }
    } catch (err) {
      console.error('Failed to load post:', err)
    } finally {
      setPostLoading(false)
    }
  }

  // Open category in side panel
  const openCategory = async (categoryName: string) => {
    setSelectedPost(null) // Clear post view
    setCategoryLoading(true)
    setSelectedCategory(categoryName)
    setIsPanelOpen(true)

    try {
      // Fetch all posts and filter by category
      const res = await fetch('/api/blog/graph')
      if (res.ok) {
        const data = await res.json()
        // Filter posts by category and sort by date (newest first)
        const posts = (data.nodes || [])
          .filter((post: { categoryName: string | null }) => {
            const postCat = post.categoryName?.toLowerCase() || ''
            const targetCat = categoryName.toLowerCase()
            if (targetCat === 'software') {
              return postCat.includes('software') || postCat.includes('engineering')
            }
            if (targetCat === 'data science') {
              return postCat.includes('data')
            }
            if (targetCat === 'projects') {
              return postCat.includes('project')
            }
            return false
          })
          .sort((a: { publishedAt: string }, b: { publishedAt: string }) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )
        setCategoryPosts(posts)
      }
    } catch (err) {
      console.error('Failed to load category posts:', err)
    } finally {
      setCategoryLoading(false)
    }
  }

  // Close panel
  const closePanel = () => {
    setIsPanelOpen(false)
    setTimeout(() => {
      setSelectedPost(null)
      setSelectedCategory(null)
      setCategoryPosts([])
    }, 300) // Clear after animation
  }

  // Apply syntax highlighting when post content loads
  useEffect(() => {
    if (selectedPost && !postLoading) {
      const applyHighlighting = async () => {
        const hljs = (await import('highlight.js')).default
        document.querySelectorAll('.blog-content pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement)
        })
      }
      // Small delay to ensure DOM is ready
      setTimeout(applyHighlighting, 100)
    }
  }, [selectedPost, postLoading])

  const nodesRef = useRef<GraphNode[]>([])
  const linksRef = useRef<GraphLink[]>([])
  const simulationRef = useRef<Simulation<GraphNode, GraphLink> | null>(null)
  const drawRef = useRef<() => void>(() => {})

  // Category colors
  const CATEGORY_COLORS: Record<string, string> = {
    'Software': '#5B2C91',      // Royal Purple
    'Data Science': '#2E86AB',  // Blue
    'Projects': '#A23B72',      // Magenta/Pink
    'default': '#6B7280'        // Gray fallback
  }

  // Draw function - stored in ref so simulation can access latest version
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const width = canvas.width
    const height = canvas.height

    if (width === 0 || height === 0) return

    ctx.clearRect(0, 0, width, height)
    ctx.save()

    // Apply transform
    ctx.translate(transform.x + width / 2, transform.y + height / 2)
    ctx.scale(transform.k, transform.k)
    ctx.translate(-width / 2, -height / 2)

    // Draw links
    linksRef.current.forEach(link => {
      const source = link.source as GraphNode
      const target = link.target as GraphNode
      if (source.x !== undefined && source.y !== undefined &&
          target.x !== undefined && target.y !== undefined) {
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })

    // Draw nodes (Obsidian style - filled dots with text below)
    nodesRef.current.forEach(node => {
      if (node.x === undefined || node.y === undefined) return

      const isHovered = hoveredNode?.id === node.id
      // Smaller node sizes like Obsidian
      const dotSize = node.type === 'center' ? 12 : node.type === 'topic' ? 8 : 6

      // Glow effect for hovered
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, dotSize + 8, 0, Math.PI * 2)
        ctx.fillStyle = `${node.color}40`
        ctx.fill()
      }

      // Filled circle (dot)
      ctx.beginPath()
      ctx.arc(node.x, node.y, isHovered ? dotSize + 2 : dotSize, 0, Math.PI * 2)
      ctx.fillStyle = node.color
      ctx.fill()

      // Label below the dot - scale font size based on title length
      const labelLength = node.label.length
      let baseFontSize = node.type === 'center' ? 14 : node.type === 'topic' ? 12 : 11

      // Scale down font size for longer titles
      let fontSize = baseFontSize
      if (labelLength > 50) {
        fontSize = Math.max(8, baseFontSize - 4)
      } else if (labelLength > 40) {
        fontSize = Math.max(9, baseFontSize - 3)
      } else if (labelLength > 30) {
        fontSize = Math.max(9, baseFontSize - 2)
      } else if (labelLength > 20) {
        fontSize = Math.max(10, baseFontSize - 1)
      }

      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`
      ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Wrap text to multiple lines (max 3 lines)
      const maxLineWidth = 120
      const words = node.label.split(' ')
      const lines: string[] = []
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const testWidth = ctx.measureText(testLine).width

        if (testWidth <= maxLineWidth) {
          currentLine = testLine
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      }
      if (currentLine) lines.push(currentLine)

      // Limit to 3 lines, truncate last line if needed
      const displayLines = lines.slice(0, 3)
      if (lines.length > 3) {
        let lastLine = displayLines[2]
        while (ctx.measureText(lastLine + '...').width > maxLineWidth && lastLine.length > 3) {
          lastLine = lastLine.substring(0, lastLine.length - 1)
        }
        displayLines[2] = lastLine + '...'
      }

      // Draw each line centered
      const lineHeight = fontSize * 1.3
      const startY = node.y + dotSize + 6
      displayLines.forEach((line, i) => {
        ctx.fillText(line, node.x, startY + i * lineHeight)
      })
    })

    ctx.restore()
  }, [transform, hoveredNode])

  // Keep drawRef updated
  useEffect(() => {
    drawRef.current = draw
  }, [draw])

  // Fetch data and initialize - run only once
  useEffect(() => {
    if (initialized) return

    async function init() {
      try {
        const res = await fetch('/api/blog/graph')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()

        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        // Wait for container to have dimensions
        let attempts = 0
        while ((container.clientWidth === 0 || container.clientHeight === 0) && attempts < 10) {
          await new Promise(r => setTimeout(r, 100))
          attempts++
        }

        const width = container.clientWidth || 800
        const height = container.clientHeight || 600
        canvas.width = width
        canvas.height = height

        console.log('MindCloud: Initializing with dimensions', width, height)

        // Build nodes
        const nodes: GraphNode[] = []
        const links: GraphLink[] = []

        // Color helper function
        const getCategoryColor = (name: string): string => {
          if (name.toLowerCase().includes('software') || name.toLowerCase().includes('engineering')) {
            return '#5B2C91' // Royal Purple
          }
          if (name.toLowerCase().includes('data')) {
            return '#2E86AB' // Blue
          }
          if (name.toLowerCase().includes('project')) {
            return '#A23B72' // Magenta
          }
          return '#6B7280' // Gray fallback
        }

        // Center "Blog" node
        nodes.push({
          id: 'blog-center',
          label: 'Blog',
          type: 'center',
          color: '#FFFFFF',
          size: 50,
          x: width / 2,
          y: height / 2,
          fx: width / 2,
          fy: height / 2
        })

        // Category nodes (Software, Data Science, Projects)
        const categoryColors: Record<string, string> = {
          'Software': '#5B2C91',
          'Data Science': '#2E86AB',
          'Projects': '#A23B72'
        }

        const mainCategories = ['Software', 'Data Science', 'Projects']
        mainCategories.forEach((catName) => {
          nodes.push({
            id: `cat-${catName.toLowerCase().replace(' ', '-')}`,
            label: catName,
            type: 'topic',
            color: categoryColors[catName],
            size: 35
          })
          links.push({
            source: 'blog-center',
            target: `cat-${catName.toLowerCase().replace(' ', '-')}`,
            strength: 0.8
          })
        })

        // Post nodes - connect to their category
        console.log('MindCloud: Posts', data.nodes)
        ;(data.nodes || []).forEach((post: {
          id: string
          slug: string
          title: string
          categoryId: string | null
          categoryName: string | null
        }) => {
          const categoryName = post.categoryName || ''
          const color = getCategoryColor(categoryName)
          nodes.push({
            id: post.id,
            slug: post.slug,
            label: post.title,
            type: 'post',
            color: color,
            size: 28
          })

          // Link to appropriate category node
          let targetCategory = 'cat-software' // default
          if (categoryName.toLowerCase().includes('data')) {
            targetCategory = 'cat-data-science'
          } else if (categoryName.toLowerCase().includes('project')) {
            targetCategory = 'cat-projects'
          } else if (categoryName.toLowerCase().includes('software') || categoryName.toLowerCase().includes('engineering')) {
            targetCategory = 'cat-software'
          }

          links.push({
            source: targetCategory,
            target: post.id,
            strength: 0.6
          })
        })

        // Post-to-post backlinks
        ;(data.links || []).forEach((link: { source: string; target: string }) => {
          links.push({
            source: link.source,
            target: link.target,
            strength: 0.4
          })
        })

        console.log('MindCloud: Total nodes', nodes.length, 'links', links.length)

        nodesRef.current = nodes
        linksRef.current = links

        // Create simulation
        const simulation = forceSimulation<GraphNode>(nodes)
          .force('link', forceLink<GraphNode, GraphLink>(links)
            .id(d => d.id)
            .distance(120)
            .strength(d => d.strength))
          .force('charge', forceManyBody().strength(-300))
          .force('center', forceCenter(width / 2, height / 2))
          .force('collision', forceCollide<GraphNode>().radius(d => d.size + 20))

        simulationRef.current = simulation

        simulation.on('tick', () => {
          drawRef.current()
        })

        // Run simulation for a bit then stop for performance
        simulation.alpha(1).restart()
        setTimeout(() => {
          simulation.stop()
          // Do one final draw
          drawRef.current()
        }, 3000)

        setInitialized(true)
        setLoading(false)
      } catch (err) {
        console.error('Failed to initialize mind cloud:', err)
        setLoading(false)
      }
    }

    init()
  }, [initialized])

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setTransform(prev => ({
        ...prev,
        k: Math.max(0.3, Math.min(3, prev.k * delta))
      }))
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [])

  // Mouse drag pan
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicking on a node
      const rect = canvas.getBoundingClientRect()
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const x = (e.clientX - rect.left - transform.x - centerX) / transform.k + centerX
      const y = (e.clientY - rect.top - transform.y - centerY) / transform.k + centerY

      for (const node of nodesRef.current) {
        if (node.x === undefined || node.y === undefined) continue
        const dx = x - node.x
        const dy = y - node.y
        if (Math.sqrt(dx * dx + dy * dy) < node.size + 5) {
          // Clicked on node, don't start drag
          return
        }
      }

      setIsDragging(true)
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setTransform(prev => ({
          ...prev,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }))
      } else {
        // Hover detection
        const rect = canvas.getBoundingClientRect()
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const x = (e.clientX - rect.left - transform.x - centerX) / transform.k + centerX
        const y = (e.clientY - rect.top - transform.y - centerY) / transform.k + centerY

        let found: GraphNode | null = null
        for (const node of nodesRef.current) {
          if (node.x === undefined || node.y === undefined) continue
          const dx = x - node.x
          const dy = y - node.y
          if (Math.sqrt(dx * dx + dy * dy) < node.size + 5) {
            found = node
            break
          }
        }

        setHoveredNode(found)
        canvas.style.cursor = found ? 'pointer' : isDragging ? 'grabbing' : 'grab'
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleClick = async (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const x = (e.clientX - rect.left - transform.x - centerX) / transform.k + centerX
      const y = (e.clientY - rect.top - transform.y - centerY) / transform.k + centerY

      for (const node of nodesRef.current) {
        if (node.x === undefined || node.y === undefined) continue
        const dx = x - node.x
        const dy = y - node.y
        if (Math.sqrt(dx * dx + dy * dy) < node.size + 5) {
          if (node.type === 'post' && node.slug) {
            openPost(node.slug)
          } else if (node.type === 'topic') {
            // Click on category node - show list of posts
            openCategory(node.label)
          }
          break
        }
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('click', handleClick)
    }
  }, [isDragging, dragStart, transform])

  // Redraw on transform/hover change
  useEffect(() => {
    draw()
  }, [draw])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      drawRef.current()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Store the original center position for shifting calculations
  const originalCenterRef = useRef<{ x: number; y: number } | null>(null)

  // Trigger resize and shift all nodes when panel opens/closes
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !initialized) return

    // Wait for CSS transition to complete (300ms)
    const shiftNodes = () => {
      const fullWidth = window.innerWidth
      const newContainerWidth = isPanelOpen ? fullWidth / 2 : fullWidth
      const newCenterX = newContainerWidth / 2
      const newCenterY = container.clientHeight / 2

      // Store original center on first render
      if (!originalCenterRef.current) {
        originalCenterRef.current = { x: fullWidth / 2, y: newCenterY }
      }

      const oldCenterX = originalCenterRef.current.x
      const shiftX = newCenterX - oldCenterX

      // Shift all node positions
      nodesRef.current.forEach(node => {
        if (typeof node.x === 'number') {
          node.x += shiftX
        }
        // Update fixed position for center node
        if (node.id === 'blog-center') {
          node.fx = newCenterX
          node.fy = newCenterY
        }
      })

      // Update original center for next shift
      originalCenterRef.current = { x: newCenterX, y: newCenterY }

      // Update canvas size
      canvas.width = newContainerWidth
      canvas.height = container.clientHeight

      // Update the simulation center force
      const simulation = simulationRef.current
      if (simulation) {
        simulation.force('center', forceCenter(newCenterX, newCenterY))
        // Brief reheat to settle any collisions
        simulation.alpha(0.1).restart()
        setTimeout(() => simulation.stop(), 500)
      }

      drawRef.current()
    }

    // Shift immediately and after CSS transition
    shiftNodes()
    const t1 = setTimeout(shiftNodes, 150)
    const t2 = setTimeout(shiftNodes, 350)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isPanelOpen, initialized])

  return (
    <div className={`flex ${className}`} style={{ background: '#000000' }}>
      {/* Mind Cloud Section */}
      <div
        ref={containerRef}
        className="relative transition-all duration-300 ease-in-out h-full"
        style={{
          width: isPanelOpen ? '50%' : '100%',
          background: '#000000'
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', opacity: loading ? 0 : 1 }}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading mind cloud...</p>
            </div>
          </div>
        )}

        {/* Hover tooltip */}
        {!loading && !isPanelOpen && hoveredNode && hoveredNode.type === 'post' && (
          <div
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 pointer-events-none"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <p className="font-semibold text-white">{hoveredNode.label}</p>
            <p className="text-sm text-purple-400 mt-2">Click to read post →</p>
          </div>
        )}

        {/* Controls hint */}
        {!loading && !isPanelOpen && (
          <div
            className="absolute bottom-4 right-4 px-4 py-2 text-sm text-gray-400"
            style={{ background: 'rgba(20, 20, 20, 0.9)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            Scroll to zoom · Drag to pan
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div
            className="absolute top-4 left-4 px-4 py-3"
            style={{ background: 'rgba(20, 20, 20, 0.9)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#5B2C91' }} />
                <span className="text-gray-300">Software</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#2E86AB' }} />
                <span className="text-gray-300">Data Science</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#A23B72' }} />
                <span className="text-gray-300">Projects</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div
        className="h-full overflow-hidden transition-all duration-300 ease-in-out border-l border-gray-800"
        style={{
          width: isPanelOpen ? '50%' : '0%',
          background: '#0a0a0a'
        }}
      >
        {isPanelOpen && (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-800">
              <button
                onClick={closePanel}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              {selectedCategory ? (
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selectedCategory}</h2>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-400 text-sm">
                    {categoryPosts.length} {categoryPosts.length === 1 ? 'article' : 'articles'}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Back to graph</span>
              )}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Loading state */}
              {(postLoading || categoryLoading) ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : selectedCategory ? (
                /* Category list view */
                <div className="p-6">
                  {categoryPosts.length === 0 ? (
                    <p className="text-gray-500">No articles in this category yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {categoryPosts.map((post, index) => (
                        <button
                          key={post.id || `post-${index}`}
                          onClick={() => openPost(post.slug)}
                          className="w-full text-left p-4 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all group"
                        >
                          <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors mb-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {post.readingTimeMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {post.readingTimeMinutes} min
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : selectedPost ? (
                <article className="p-6">
                  {/* Category & Tags */}
                  {selectedPost.category && (
                    <div className="mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ background: selectedPost.category.color || '#5B2C91' }}
                      >
                        {selectedPost.category.name}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {selectedPost.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(selectedPost.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {selectedPost.readingTimeMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{selectedPost.readingTimeMinutes} min read</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedPost.tags.map((tag, index) => (
                        <span
                          key={tag.id || `tag-${index}`}
                          className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="prose prose-invert max-w-none blog-content
                      prose-p:text-white prose-p:leading-relaxed prose-p:opacity-90
                      prose-headings:text-white
                      prose-strong:text-white
                      prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                      prose-li:text-white prose-li:opacity-90
                      prose-blockquote:border-purple-500 prose-blockquote:text-gray-100
                      [&_pre]:bg-[#1e1e1e] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto
                      [&_code]:text-[#d4d4d4] [&_code]:text-sm
                      [&_.hljs-keyword]:text-[#569cd6] [&_.hljs-string]:text-[#ce9178]
                      [&_.hljs-number]:text-[#b5cea8] [&_.hljs-function]:text-[#dcdcaa]
                      [&_.hljs-comment]:text-[#6a9955] [&_.hljs-built_in]:text-[#4ec9b0]
                      [&_.hljs-title]:text-[#dcdcaa] [&_.hljs-params]:text-[#9cdcfe]
                      [&_.hljs-attr]:text-[#9cdcfe] [&_.hljs-variable]:text-[#9cdcfe]"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-800">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                      <Heart size={18} />
                      <span>Like</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Failed to load post
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
