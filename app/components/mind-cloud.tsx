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
  coverImage?: string | null
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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

    // Reset view to center on whole graph
    setTransform({ x: 0, y: 0, k: 1 })

    // Release the fixed node so it can float again
    if (focusedNodeRef.current) {
      const focusedNode = nodesRef.current.find(n => n.id === focusedNodeRef.current)
      if (focusedNode) {
        focusedNode.fx = null
        focusedNode.fy = null
      }
      focusedNodeRef.current = null
    }

    // Reheat simulation so nodes start moving
    const simulation = simulationRef.current
    if (simulation) {
      simulation.alpha(0.3).restart()
    }

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
  const focusedNodeRef = useRef<string | null>(null)

  // Draw function - stored in ref so simulation can access latest version
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const width = canvas.width
    const height = canvas.height

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
      const baseFontSize = node.type === 'center' ? 14 : node.type === 'topic' ? 12 : 11

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
          // Apply very subtle ambient floating motion
          const time = Date.now() * 0.001 // Time in seconds

          nodesRef.current.forEach((node, i) => {
            if (node.x === undefined || node.y === undefined) return
            if (node.fx !== null && node.fx !== undefined) return // Skip fixed nodes

            // Each node gets a unique phase based on its index
            const phase = i * 2.3
            const floatStrength = 0.08 // Very subtle movement

            // Gentle oscillation - add small displacement, not velocity
            // This keeps nodes in their area instead of drifting
            const offsetX = Math.sin(time * 0.3 + phase) * floatStrength
            const offsetY = Math.cos(time * 0.25 + phase * 0.8) * floatStrength

            node.vx = (node.vx || 0) * 0.95 + offsetX // Dampen existing velocity
            node.vy = (node.vy || 0) * 0.95 + offsetY
          })

          drawRef.current()
        })

        // Run simulation initially
        simulation.alpha(1).restart()

        // After initial settle, keep simulation running with gentle energy
        setTimeout(() => {
          simulation.alphaMin(0).alphaDecay(0.01).alphaTarget(0.03).restart()
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
          focusedNodeRef.current = node.id

          if (node.type === 'post' && node.slug) {
            // Pan/zoom to focus on this node in its natural position
            // The new canvas will be 50% width after panel opens
            const newCanvasWidth = window.innerWidth / 2
            const newCenterX = newCanvasWidth / 2
            const newCenterY = canvas.height / 2

            // Fix the node in place so it doesn't drift while reading
            node.fx = node.x
            node.fy = node.y

            // Calculate transform to center on this node's current position
            const newZoom = 1.8
            const panX = (newCenterX - node.x) * newZoom
            const panY = (newCenterY - node.y) * newZoom

            setTransform({ x: panX, y: panY, k: newZoom })

            openPost(node.slug)
          } else if (node.type === 'topic') {
            const newCanvasWidth = window.innerWidth / 2
            const newCenterX = newCanvasWidth / 2
            const newCenterY = canvas.height / 2

            node.fx = node.x
            node.fy = node.y

            const newZoom = 1.8
            const panX = (newCenterX - node.x) * newZoom
            const panY = (newCenterY - node.y) * newZoom

            setTransform({ x: panX, y: panY, k: newZoom })

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

  // Touch state refs (persist across renders)
  const touchStateRef = useRef({
    lastTouchDistance: 0,
    touchStartPos: { x: 0, y: 0 },
    isTouchDragging: false,
    initialTransform: { x: 0, y: 0 }
  })

  // Touch events for mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      const state = touchStateRef.current

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        state.touchStartPos = { x: touch.clientX, y: touch.clientY }
        state.initialTransform = { x: transform.x, y: transform.y }

        // Check if touching a node
        const rect = canvas.getBoundingClientRect()
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const nodeX = (touch.clientX - rect.left - transform.x - centerX) / transform.k + centerX
        const nodeY = (touch.clientY - rect.top - transform.y - centerY) / transform.k + centerY

        let touchedNode = false
        for (const node of nodesRef.current) {
          if (node.x === undefined || node.y === undefined) continue
          const dx = nodeX - node.x
          const dy = nodeY - node.y
          if (Math.sqrt(dx * dx + dy * dy) < node.size + 10) {
            touchedNode = true
            break
          }
        }

        state.isTouchDragging = !touchedNode
      } else if (e.touches.length === 2) {
        // Pinch zoom start
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        state.lastTouchDistance = Math.sqrt(dx * dx + dy * dy)
        state.isTouchDragging = false
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const state = touchStateRef.current

      if (e.touches.length === 1 && state.isTouchDragging) {
        // Pan
        const touch = e.touches[0]
        const deltaX = touch.clientX - state.touchStartPos.x
        const deltaY = touch.clientY - state.touchStartPos.y

        setTransform(prev => ({
          ...prev,
          x: state.initialTransform.x + deltaX,
          y: state.initialTransform.y + deltaY
        }))
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (state.lastTouchDistance > 0) {
          const scale = distance / state.lastTouchDistance
          setTransform(prev => ({
            ...prev,
            k: Math.max(0.3, Math.min(3, prev.k * scale))
          }))
        }
        state.lastTouchDistance = distance
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const state = touchStateRef.current

      if (e.changedTouches.length === 1 && !state.isTouchDragging) {
        // Tap on node
        const touch = e.changedTouches[0]
        const rect = canvas.getBoundingClientRect()
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const nodeX = (touch.clientX - rect.left - transform.x - centerX) / transform.k + centerX
        const nodeY = (touch.clientY - rect.top - transform.y - centerY) / transform.k + centerY

        for (const node of nodesRef.current) {
          if (node.x === undefined || node.y === undefined) continue
          const dx = nodeX - node.x
          const dy = nodeY - node.y
          if (Math.sqrt(dx * dx + dy * dy) < node.size + 10) {
            focusedNodeRef.current = node.id

            if (node.type === 'post' && node.slug) {
              node.fx = node.x
              node.fy = node.y
              openPost(node.slug)
            } else if (node.type === 'topic') {
              node.fx = node.x
              node.fy = node.y
              openCategory(node.label)
            }
            break
          }
        }
      }

      state.isTouchDragging = false
      state.lastTouchDistance = 0
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [transform, openPost, openCategory])

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

      // Shift node positions only when NOT focused (normal open/close without selection)
      const focusedId = focusedNodeRef.current

      if (!focusedId) {
        // Normal panel open/close - shift all nodes to re-center
        nodesRef.current.forEach(node => {
          if (typeof node.x === 'number') {
            node.x += shiftX
          }
          if (node.fx !== null && node.fx !== undefined) {
            node.fx += shiftX
          }
          // Keep Blog node centered
          if (node.id === 'blog-center') {
            node.fx = newCenterX
            node.fy = newCenterY
          }
        })
      } else {
        // Focused mode - release Blog node to float naturally
        const blogNode = nodesRef.current.find(n => n.id === 'blog-center')
        if (blogNode) {
          blogNode.fx = null
          blogNode.fy = null
        }
      }

      // Update original center for next shift
      originalCenterRef.current = { x: newCenterX, y: newCenterY }

      // Update canvas size
      canvas.width = newContainerWidth
      canvas.height = container.clientHeight

      // Update the simulation center force
      const simulation = simulationRef.current
      if (simulation) {
        if (focusedId) {
          // When focused, remove center force so nodes don't all rush to center
          // and keep simulation very calm
          simulation.force('center', null)
          simulation.alpha(0.05).alphaTarget(0.02).restart()
        } else {
          // When not focused, restore center force
          simulation.force('center', forceCenter(newCenterX, newCenterY))
          simulation.alpha(0.3).alphaTarget(0.03).restart()
        }
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
          width: isPanelOpen ? (isMobile ? '0%' : '50%') : '100%',
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

        {/* Controls hint */}
        {!loading && !isPanelOpen && (
          <div
            className="absolute bottom-4 right-4 px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-400"
            style={{ background: 'rgba(20, 20, 20, 0.9)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            {isMobile ? 'Pinch to zoom · Drag to pan' : 'Scroll to zoom · Drag to pan'}
          </div>
        )}

        {/* Legend - hide on mobile when panel is open */}
        {!loading && !(isMobile && isPanelOpen) && (
          <div
            className="absolute top-4 left-4 px-3 py-2 sm:px-4 sm:py-3"
            style={{ background: 'rgba(20, 20, 20, 0.9)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm">
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
          width: isPanelOpen ? (isMobile ? '100%' : '50%') : '0%',
          background: '#0a0a0a'
        }}
      >
        {isPanelOpen && (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
              <button
                onClick={closePanel}
                className="p-3 rounded-md hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">{selectedCategory}</h2>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-400 text-xs">
                    {categoryPosts.length} {categoryPosts.length === 1 ? 'article' : 'articles'}
                  </span>
                </div>
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
                  {/* Cover Image */}
                  {selectedPost.coverImage && (
                    <div className="relative w-full h-32 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-6">
                      <img
                        src={selectedPost.coverImage}
                        alt={selectedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

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
                    className="blog-content max-w-none
                      [&_p]:text-white [&_p]:leading-relaxed [&_p]:opacity-90 [&_p]:mb-6
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3
                      [&_strong]:text-white [&_strong]:font-semibold
                      [&_a]:text-purple-400 [&_a]:no-underline hover:[&_a]:underline
                      [&_ul]:my-6 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-6 [&_ol]:pl-6 [&_ol]:list-decimal
                      [&_li]:text-white [&_li]:opacity-90 [&_li]:mb-3
                      [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:text-gray-100
                      [&_pre]:bg-[#1e1e1e] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6
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
