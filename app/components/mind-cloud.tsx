'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, Heart, Share2, Calendar, Clock, Star, GitFork, Code, ExternalLink, Github } from 'lucide-react'
import 'highlight.js/styles/vs2015.css'

interface ProjectData {
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

interface GraphNode {
  id: string
  slug?: string
  label: string
  type: 'center' | 'topic' | 'post'
  color: string
  size: number
  isProject?: boolean
  projectData?: ProjectData
  // Current position (animated)
  x: number
  y: number
  // Target position (final)
  targetX: number
  targetY: number
  // Parent for hierarchy
  parentId?: string
  // Angle from center for radial layout
  angle?: number
}

interface GraphLink {
  source: string
  target: string
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

// Easing functions
const easeOutElastic = (t: number): number => {
  if (t === 0 || t === 1) return t
  const p = 0.3
  const s = p / 4
  return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1
}

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
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

  // Focus state - which parent cluster is focused (null = overview)
  const [focusedParent, setFocusedParent] = useState<string | null>(null)

  // Side panel state
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [postLoading, setPostLoading] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Category list state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryPosts, setCategoryPosts] = useState<BlogPost[]>([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  // Project state
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  // Animation state
  const animationRef = useRef<number | null>(null)
  const zoomAnimationRef = useRef<number | null>(null)
  const explosionCompleteRef = useRef(false)

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
    setSelectedCategory(null)
    setSelectedProject(null)
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

  // Open project in side panel
  const openProject = (projectData: ProjectData) => {
    setSelectedPost(null)
    setSelectedCategory(null)
    setCategoryPosts([])
    setSelectedProject(projectData)
    setIsPanelOpen(true)

    // Track view
    fetch(`/api/projects/${projectData.id}/view`, { method: 'POST' }).catch(() => {})
  }

  // Close panel
  const closePanel = useCallback(() => {
    // Cancel any running zoom animation
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current)
      zoomAnimationRef.current = null
    }

    setIsPanelOpen(false)
    setFocusedParent(null)

    // Calculate transform that centers the center node
    const canvas = canvasRef.current
    const centerNode = nodesRef.current.find(n => n.id === 'blog-center')

    if (canvas && centerNode) {
      const canvasCenterX = canvas.width / 2
      const canvasCenterY = canvas.height / 2
      const panX = canvasCenterX - centerNode.x
      const panY = canvasCenterY - centerNode.y
      setTransform({ x: panX, y: panY, k: 1 })
    } else {
      setTransform({ x: 0, y: 0, k: 1 })
    }

    setTimeout(() => {
      setSelectedPost(null)
      setSelectedCategory(null)
      setSelectedProject(null)
      setCategoryPosts([])
    }, 300)
  }, [])

  // Apply syntax highlighting when post content loads
  useEffect(() => {
    if (selectedPost && !postLoading) {
      const applyHighlighting = async () => {
        const hljs = (await import('highlight.js')).default
        document.querySelectorAll('.blog-content pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement)
        })
      }
      setTimeout(applyHighlighting, 100)
    }
  }, [selectedPost, postLoading])

  const nodesRef = useRef<GraphNode[]>([])
  const linksRef = useRef<GraphLink[]>([])
  const drawRef = useRef<() => void>(() => {})
  const canvasCenterRef = useRef({ x: 0, y: 0 })

  // Animate transform smoothly
  const animateTransform = useCallback((targetTransform: { x: number; y: number; k: number }, duration: number) => {
    const startTransform = { ...transform }
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(t)

      setTransform({
        x: lerp(startTransform.x, targetTransform.x, eased),
        y: lerp(startTransform.y, targetTransform.y, eased),
        k: lerp(startTransform.k, targetTransform.k, eased)
      })

      if (t < 1) {
        requestAnimationFrame(animate)
      }
    }
    animate()
  }, [transform])

  // Animate to a specific node (zoom and pan)
  const animateToNode = useCallback((node: GraphNode, targetZoom: number) => {
    // Cancel any running zoom animation
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current)
      zoomAnimationRef.current = null
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    // Calculate target pan to center the node
    const targetPanX = (centerX - node.x) * targetZoom
    const targetPanY = (centerY - node.y) * targetZoom

    // Animate using functional setState to avoid stale closures
    let startTransform: { x: number; y: number; k: number } | null = null
    const duration = 500
    const startTime = Date.now()

    const animate = () => {
      setTransform(prev => {
        if (!startTransform) {
          startTransform = { ...prev }
        }

        const elapsed = Date.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(t)

        return {
          x: lerp(startTransform.x, targetPanX, eased),
          y: lerp(startTransform.y, targetPanY, eased),
          k: lerp(startTransform.k, targetZoom, eased)
        }
      })

      if (Date.now() - startTime < duration) {
        zoomAnimationRef.current = requestAnimationFrame(animate)
      } else {
        zoomAnimationRef.current = null
      }
    }
    zoomAnimationRef.current = requestAnimationFrame(animate)
  }, [])

  // Return to overview (unfocus)
  const returnToOverview = useCallback(() => {
    // Cancel any running zoom animation FIRST
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current)
      zoomAnimationRef.current = null
    }

    setFocusedParent(null)

    // Calculate transform that centers the center node
    const canvas = canvasRef.current
    const centerNode = nodesRef.current.find(n => n.id === 'blog-center')

    if (canvas && centerNode) {
      const canvasCenterX = canvas.width / 2
      const canvasCenterY = canvas.height / 2
      // Pan to center the center node
      const panX = canvasCenterX - centerNode.x
      const panY = canvasCenterY - centerNode.y
      setTransform({ x: panX, y: panY, k: 1 })
    } else {
      setTransform({ x: 0, y: 0, k: 1 })
    }
  }, [])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPanelOpen) {
          closePanel()
        } else if (focusedParent) {
          returnToOverview()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPanelOpen, focusedParent, closePanel, returnToOverview])

  // Check if a node is a child of a parent
  const isChildOf = useCallback((node: GraphNode, parentId: string): boolean => {
    return node.parentId === parentId
  }, [])

  // Draw function
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

    // Determine which nodes to show with full opacity
    const isFocused = focusedParent !== null

    // Draw links
    linksRef.current.forEach(link => {
      const sourceNode = nodesRef.current.find(n => n.id === link.source)
      const targetNode = nodesRef.current.find(n => n.id === link.target)
      if (!sourceNode || !targetNode) return

      // Determine link opacity based on focus state
      let linkOpacity = 0.25
      if (isFocused) {
        const isRelevantToFocus =
          sourceNode.id === focusedParent ||
          targetNode.id === focusedParent ||
          sourceNode.parentId === focusedParent ||
          targetNode.parentId === focusedParent

        linkOpacity = isRelevantToFocus ? 0.4 : 0.08
      }

      ctx.beginPath()
      ctx.moveTo(sourceNode.x, sourceNode.y)
      ctx.lineTo(targetNode.x, targetNode.y)
      ctx.strokeStyle = `rgba(255, 255, 255, ${linkOpacity})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Draw nodes
    nodesRef.current.forEach(node => {
      const isHovered = hoveredNode?.id === node.id
      const dotSize = node.size

      // Determine node opacity based on focus state
      let nodeOpacity = 1
      let showLabel = false

      if (node.type === 'center') {
        // Center node - always visible, never show label
        nodeOpacity = 1
        showLabel = false
      } else if (node.type === 'topic') {
        // Category/language nodes - always visible with labels
        nodeOpacity = isFocused && node.id !== focusedParent ? 0.3 : 1
        showLabel = true
      } else if (node.type === 'post') {
        // Post/project nodes - only show labels when parent is focused
        if (isFocused) {
          if (node.parentId === focusedParent) {
            nodeOpacity = 1
            showLabel = true // Show labels for children of focused parent
          } else {
            nodeOpacity = 0.15
            showLabel = false
          }
        } else {
          nodeOpacity = 1
          showLabel = false // No labels in overview mode
        }
      }

      // Glow effect for hovered
      if (isHovered && nodeOpacity > 0.3) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, dotSize + 8, 0, Math.PI * 2)
        ctx.fillStyle = `${node.color}40`
        ctx.fill()
      }

      // Filled circle (dot)
      ctx.beginPath()
      ctx.arc(node.x, node.y, isHovered ? dotSize + 2 : dotSize, 0, Math.PI * 2)
      ctx.globalAlpha = nodeOpacity
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.globalAlpha = 1

      // Label below the dot (conditional)
      if (showLabel && node.label && node.label.length > 0) {
        const labelLength = node.label.length
        const baseFontSize = node.type === 'center' ? 14 : node.type === 'topic' ? 12 : 11

        let fontSize = baseFontSize
        if (labelLength > 50) fontSize = Math.max(8, baseFontSize - 4)
        else if (labelLength > 40) fontSize = Math.max(9, baseFontSize - 3)
        else if (labelLength > 30) fontSize = Math.max(9, baseFontSize - 2)
        else if (labelLength > 20) fontSize = Math.max(10, baseFontSize - 1)

        ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`
        ctx.fillStyle = isHovered ? `rgba(255, 255, 255, ${nodeOpacity})` : `rgba(255, 255, 255, ${0.85 * nodeOpacity})`
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

        const displayLines = lines.slice(0, 3)
        if (lines.length > 3) {
          let lastLine = displayLines[2]
          while (ctx.measureText(lastLine + '...').width > maxLineWidth && lastLine.length > 3) {
            lastLine = lastLine.substring(0, lastLine.length - 1)
          }
          displayLines[2] = lastLine + '...'
        }

        const lineHeight = fontSize * 1.3
        const startY = node.y + dotSize + 6
        displayLines.forEach((line, i) => {
          ctx.fillText(line, node.x, startY + i * lineHeight)
        })
      }
    })

    ctx.restore()
  }, [transform, hoveredNode, focusedParent])

  // Keep drawRef updated
  useEffect(() => {
    drawRef.current = draw
  }, [draw])

  // Calculate static node positions
  const calculateNodePositions = useCallback((
    nodes: GraphNode[],
    links: GraphLink[],
    width: number,
    height: number
  ) => {
    const centerX = width / 2
    const centerY = height / 2

    // Group nodes by parent
    const nodesByParent: Record<string, GraphNode[]> = {}
    nodes.forEach(node => {
      if (node.parentId) {
        if (!nodesByParent[node.parentId]) nodesByParent[node.parentId] = []
        nodesByParent[node.parentId].push(node)
      }
    })

    // Position each node based on its type and parent
    nodes.forEach(node => {
      if (node.type === 'center') {
        node.targetX = centerX
        node.targetY = centerY
      } else if (node.type === 'topic' && node.id.startsWith('cat-')) {
        // Main categories - already positioned with angle
        // Keep their positions
      } else if (node.type === 'topic' && node.id.startsWith('lang-')) {
        // Language nodes - position in arc from Projects category
        const projectsCat = nodes.find(n => n.id === 'cat-projects')
        if (projectsCat) {
          const siblings = nodes.filter(n => n.id.startsWith('lang-'))
          const siblingIndex = siblings.indexOf(node)
          const totalSiblings = siblings.length

          // Fan out from Projects at ~120° arc
          const arcAngle = Math.PI * 0.7 // 126° arc
          const startAngle = (projectsCat.angle || 0) - arcAngle / 2
          const angleStep = arcAngle / Math.max(totalSiblings - 1, 1)
          const angle = startAngle + siblingIndex * angleStep

          const radius = Math.min(width, height) * 0.20 // Distance from Projects
          node.targetX = projectsCat.targetX + Math.cos(angle) * radius
          node.targetY = projectsCat.targetY + Math.sin(angle) * radius
          node.angle = angle
        }
      } else if (node.type === 'post' && node.parentId) {
        // Post/project nodes - position in arc around their parent
        const parent = nodes.find(n => n.id === node.parentId)
        if (parent) {
          const siblings = nodesByParent[node.parentId] || []
          const siblingIndex = siblings.indexOf(node)
          const totalSiblings = siblings.length

          // Calculate arc based on number of siblings
          const arcAngle = Math.min(Math.PI * 1.2, Math.PI * 0.3 * totalSiblings)
          const radius = Math.min(width, height) * 0.15

          // Start angle based on parent's angle (fan outward)
          const parentAngle = parent.angle || 0
          const startAngle = parentAngle - arcAngle / 2
          const angleStep = arcAngle / Math.max(totalSiblings - 1, 1)
          const angle = totalSiblings === 1 ? parentAngle : startAngle + siblingIndex * angleStep

          node.targetX = parent.targetX + Math.cos(angle) * radius
          node.targetY = parent.targetY + Math.sin(angle) * radius
          node.angle = angle
        }
      }
    })

    // Start all nodes at center for explosion effect
    nodes.forEach(node => {
      node.x = centerX + (Math.random() - 0.5) * 10
      node.y = centerY + (Math.random() - 0.5) * 10
    })
  }, [])

  // Explosion animation
  const animateExplosion = useCallback(() => {
    const duration = 1500 // ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutElastic(t)

      const centerX = canvasCenterRef.current.x
      const centerY = canvasCenterRef.current.y

      nodesRef.current.forEach(node => {
        node.x = lerp(centerX, node.targetX, eased)
        node.y = lerp(centerY, node.targetY, eased)
      })

      drawRef.current()

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        explosionCompleteRef.current = true

        // Set the correct transform to center the graph
        const canvas = canvasRef.current
        const centerNode = nodesRef.current.find(n => n.id === 'blog-center')
        if (canvas && centerNode) {
          const canvasCenterX = canvas.width / 2
          const canvasCenterY = canvas.height / 2
          const panX = canvasCenterX - centerNode.x
          const panY = canvasCenterY - centerNode.y
          setTransform({ x: panX, y: panY, k: 1 })
        }
      }
    }

    animate()
  }, [])

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
        canvasCenterRef.current = { x: width / 2, y: height / 2 }

        // Build nodes
        const nodes: GraphNode[] = []
        const links: GraphLink[] = []

        // Color helper function
        const getCategoryColor = (name: string): string => {
          if (name.toLowerCase().includes('software') || name.toLowerCase().includes('engineering')) {
            return '#5B2C91'
          }
          if (name.toLowerCase().includes('data')) {
            return '#2E86AB'
          }
          if (name.toLowerCase().includes('project')) {
            return '#A23B72'
          }
          return '#6B7280'
        }

        // Center node (blank label)
        nodes.push({
          id: 'blog-center',
          label: '',
          type: 'center',
          color: '#FFFFFF',
          size: 8,
          x: width / 2,
          y: height / 2,
          targetX: width / 2,
          targetY: height / 2
        })

        // Category nodes
        const categoryColors: Record<string, string> = {
          'Software': '#5B2C91',
          'Data Science': '#2E86AB',
          'Projects': '#A23B72'
        }

        const mainCategories = ['Software', 'Data Science', 'Projects']
        const categoryRadius = Math.min(width, height) * 0.28

        const categoryPositions: Record<string, { x: number; y: number; angle: number }> = {}

        mainCategories.forEach((catName, index) => {
          const angle = (index * (2 * Math.PI / 3)) - (Math.PI / 2)
          const catX = width / 2 + Math.cos(angle) * categoryRadius
          const catY = height / 2 + Math.sin(angle) * categoryRadius

          categoryPositions[catName] = { x: catX, y: catY, angle }

          nodes.push({
            id: `cat-${catName.toLowerCase().replace(' ', '-')}`,
            label: catName,
            type: 'topic',
            color: categoryColors[catName],
            size: 8,
            x: width / 2,
            y: height / 2,
            targetX: catX,
            targetY: catY,
            angle,
            parentId: 'blog-center'
          })
          links.push({
            source: 'blog-center',
            target: `cat-${catName.toLowerCase().replace(' ', '-')}`,
            strength: 1.0
          })
        })

        // Collect languages for project subcategories
        const projectLanguages = new Set<string>()
        const projectsByLanguage: Record<string, string[]> = {}

        ;(data.nodes || []).forEach((post: {
          id: string
          isProject?: boolean
          projectData?: ProjectData
        }) => {
          if (post.isProject && post.projectData?.primaryLanguage) {
            const lang = post.projectData.primaryLanguage
            projectLanguages.add(lang)
            if (!projectsByLanguage[lang]) projectsByLanguage[lang] = []
            projectsByLanguage[lang].push(post.id)
          }
        })

        // Create language subcategory nodes
        const LANGUAGE_NODE_COLOR = '#C44B8C'
        const projectsPos = categoryPositions['Projects']
        const languageArray = Array.from(projectLanguages)
        const langArcAngle = Math.PI * 0.7
        const langStartAngle = projectsPos.angle - langArcAngle / 2
        const langAngleStep = langArcAngle / Math.max(languageArray.length - 1, 1)
        const langRadius = Math.min(width, height) * 0.20

        languageArray.forEach((lang, index) => {
          const angle = languageArray.length === 1 ? projectsPos.angle : langStartAngle + index * langAngleStep
          const langX = projectsPos.x + Math.cos(angle) * langRadius
          const langY = projectsPos.y + Math.sin(angle) * langRadius

          nodes.push({
            id: `lang-${lang.toLowerCase()}`,
            label: lang,
            type: 'topic',
            color: LANGUAGE_NODE_COLOR,
            size: 8,
            x: width / 2,
            y: height / 2,
            targetX: langX,
            targetY: langY,
            angle,
            parentId: 'cat-projects'
          })

          links.push({
            source: 'cat-projects',
            target: `lang-${lang.toLowerCase()}`,
            strength: 0.9
          })
        })

        // Post/Project nodes - grouped by parent
        const postsByParent: Record<string, typeof data.nodes> = {}

        ;(data.nodes || []).forEach((post: {
          id: string
          slug: string
          title: string
          categoryName: string | null
          isProject?: boolean
          projectData?: ProjectData
        }) => {
          const categoryName = post.categoryName || ''
          let targetCategory = 'cat-software'

          if (categoryName.toLowerCase().includes('data')) {
            targetCategory = 'cat-data-science'
          } else if (categoryName.toLowerCase().includes('project')) {
            if (post.isProject && post.projectData?.primaryLanguage) {
              targetCategory = `lang-${post.projectData.primaryLanguage.toLowerCase()}`
            } else {
              targetCategory = 'cat-projects'
            }
          } else if (categoryName.toLowerCase().includes('software') || categoryName.toLowerCase().includes('engineering')) {
            targetCategory = 'cat-software'
          }

          if (!postsByParent[targetCategory]) postsByParent[targetCategory] = []
          postsByParent[targetCategory].push(post)
        })

        // Now create post nodes with proper positioning
        Object.entries(postsByParent).forEach(([parentId, posts]) => {
          const parentNode = nodes.find(n => n.id === parentId)
          if (!parentNode) return

          const totalPosts = posts.length
          const arcAngle = Math.min(Math.PI * 1.2, Math.PI * 0.3 * totalPosts)
          const radius = Math.min(width, height) * 0.15
          const parentAngle = parentNode.angle || 0
          const startAngle = parentAngle - arcAngle / 2
          const angleStep = arcAngle / Math.max(totalPosts - 1, 1)

          posts.forEach((post: {
            id: string
            slug: string
            title: string
            categoryName: string | null
            isProject?: boolean
            projectData?: ProjectData
          }, index: number) => {
            const categoryName = post.categoryName || ''
            const color = getCategoryColor(categoryName)

            const angle = totalPosts === 1 ? parentAngle : startAngle + index * angleStep
            const postX = parentNode.targetX + Math.cos(angle) * radius
            const postY = parentNode.targetY + Math.sin(angle) * radius

            nodes.push({
              id: post.id,
              slug: post.slug,
              label: post.title,
              type: 'post',
              color: color,
              size: 8,
              isProject: post.isProject,
              projectData: post.projectData,
              x: width / 2,
              y: height / 2,
              targetX: postX,
              targetY: postY,
              angle,
              parentId
            })

            links.push({
              source: parentId,
              target: post.id,
              strength: 1.0
            })
          })
        })

        // Post-to-post backlinks (skip project-to-project)
        const projectNodeIds = new Set(
          (data.nodes || [])
            .filter((n: { isProject?: boolean }) => n.isProject)
            .map((n: { id: string }) => n.id)
        )

        ;(data.links || []).forEach((link: { source: string; target: string; strength?: number }) => {
          if (projectNodeIds.has(link.source) && projectNodeIds.has(link.target)) {
            return
          }
          links.push({
            source: link.source,
            target: link.target,
            strength: (link.strength || 1) * 0.9
          })
        })

        nodesRef.current = nodes
        linksRef.current = links

        // Start explosion animation
        setInitialized(true)
        setLoading(false)

        // Small delay then animate
        setTimeout(() => {
          animateExplosion()
        }, 100)

      } catch (err) {
        console.error('Failed to initialize mind cloud:', err)
        setLoading(false)
      }
    }

    init()
  }, [initialized, animateExplosion])

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

  // Mouse drag pan and click handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getNodeAtPosition = (clientX: number, clientY: number): GraphNode | null => {
      const rect = canvas.getBoundingClientRect()
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const x = (clientX - rect.left - transform.x - centerX) / transform.k + centerX
      const y = (clientY - rect.top - transform.y - centerY) / transform.k + centerY

      for (const node of nodesRef.current) {
        const dx = x - node.x
        const dy = y - node.y
        if (Math.sqrt(dx * dx + dy * dy) < node.size + 5) {
          return node
        }
      }
      return null
    }

    const handleMouseDown = (e: MouseEvent) => {
      const node = getNodeAtPosition(e.clientX, e.clientY)
      if (node) return // Don't start drag if clicking a node

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
        const found = getNodeAtPosition(e.clientX, e.clientY)
        setHoveredNode(found)
        canvas.style.cursor = found ? 'pointer' : isDragging ? 'grabbing' : 'grab'
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleClick = (e: MouseEvent) => {
      const node = getNodeAtPosition(e.clientX, e.clientY)

      if (!node) {
        // Clicked empty space - return to overview if focused
        if (focusedParent && !isPanelOpen) {
          returnToOverview()
        }
        return
      }

      if (node.type === 'center') {
        // Clicked center - return to overview
        returnToOverview()
      } else if (node.type === 'topic') {
        // Clicked category or language - focus on it
        setFocusedParent(node.id)
        animateToNode(node, 2.0)
      } else if (node.type === 'post') {
        if (focusedParent && node.parentId === focusedParent) {
          // Already focused on this cluster - open the content
          if (node.isProject && node.projectData) {
            openProject(node.projectData)
          } else if (node.slug) {
            openPost(node.slug)
          }
        } else {
          // Not focused or different cluster - focus on parent first
          const parentNode = nodesRef.current.find(n => n.id === node.parentId)
          if (parentNode) {
            setFocusedParent(parentNode.id)
            animateToNode(parentNode, 2.0)
          }
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
  }, [isDragging, dragStart, transform, focusedParent, isPanelOpen, animateToNode, returnToOverview])

  // Touch state refs
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

    const getNodeAtTouchPosition = (clientX: number, clientY: number): GraphNode | null => {
      const rect = canvas.getBoundingClientRect()
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const x = (clientX - rect.left - transform.x - centerX) / transform.k + centerX
      const y = (clientY - rect.top - transform.y - centerY) / transform.k + centerY

      for (const node of nodesRef.current) {
        const dx = x - node.x
        const dy = y - node.y
        if (Math.sqrt(dx * dx + dy * dy) < node.size + 10) {
          return node
        }
      }
      return null
    }

    const handleTouchStart = (e: TouchEvent) => {
      const state = touchStateRef.current

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        state.touchStartPos = { x: touch.clientX, y: touch.clientY }
        state.initialTransform = { x: transform.x, y: transform.y }

        const node = getNodeAtTouchPosition(touch.clientX, touch.clientY)
        state.isTouchDragging = !node
      } else if (e.touches.length === 2) {
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
        const touch = e.touches[0]
        const deltaX = touch.clientX - state.touchStartPos.x
        const deltaY = touch.clientY - state.touchStartPos.y

        setTransform(prev => ({
          ...prev,
          x: state.initialTransform.x + deltaX,
          y: state.initialTransform.y + deltaY
        }))
      } else if (e.touches.length === 2) {
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
        const touch = e.changedTouches[0]
        const node = getNodeAtTouchPosition(touch.clientX, touch.clientY)

        if (!node) {
          if (focusedParent && !isPanelOpen) {
            returnToOverview()
          }
        } else if (node.type === 'center') {
          returnToOverview()
        } else if (node.type === 'topic') {
          setFocusedParent(node.id)
          animateToNode(node, 2.0)
        } else if (node.type === 'post') {
          if (focusedParent && node.parentId === focusedParent) {
            if (node.isProject && node.projectData) {
              openProject(node.projectData)
            } else if (node.slug) {
              openPost(node.slug)
            }
          } else {
            const parentNode = nodesRef.current.find(n => n.id === node.parentId)
            if (parentNode) {
              setFocusedParent(parentNode.id)
              animateToNode(parentNode, 2.0)
            }
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
  }, [transform, focusedParent, isPanelOpen, animateToNode, returnToOverview])

  // Redraw on transform/hover/focus change
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
      canvasCenterRef.current = { x: canvas.width / 2, y: canvas.height / 2 }

      // Recenter the graph if in overview mode (not focused)
      if (!focusedParent && explosionCompleteRef.current) {
        const centerNode = nodesRef.current.find(n => n.id === 'blog-center')
        if (centerNode) {
          const canvasCenterX = canvas.width / 2
          const canvasCenterY = canvas.height / 2
          const panX = canvasCenterX - centerNode.x
          const panY = canvasCenterY - centerNode.y
          setTransform({ x: panX, y: panY, k: 1 })
        }
      }

      drawRef.current()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [focusedParent])

  // Handle panel open/close with canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !initialized) return

    const fullWidth = window.innerWidth
    const newContainerWidth = isPanelOpen ? fullWidth / 2 : fullWidth

    canvas.width = newContainerWidth
    canvas.height = container.clientHeight
    canvasCenterRef.current = { x: newContainerWidth / 2, y: container.clientHeight / 2 }

    // Recenter based on panel state and focus
    if (explosionCompleteRef.current) {
      const canvasCenterX = newContainerWidth / 2
      const canvasCenterY = container.clientHeight / 2

      if (isPanelOpen && focusedParent) {
        // Panel is open while focused - recenter on the focused node
        const focusedNode = nodesRef.current.find(n => n.id === focusedParent)
        if (focusedNode) {
          const currentZoom = 2.0 // We zoom to 2.0 when focusing
          const panX = (canvasCenterX - focusedNode.x) * currentZoom
          const panY = (canvasCenterY - focusedNode.y) * currentZoom
          setTransform({ x: panX, y: panY, k: currentZoom })
        }
      } else if (!isPanelOpen && !focusedParent) {
        // Panel closed and in overview - recenter on center node
        const centerNode = nodesRef.current.find(n => n.id === 'blog-center')
        if (centerNode) {
          const panX = canvasCenterX - centerNode.x
          const panY = canvasCenterY - centerNode.y
          setTransform({ x: panX, y: panY, k: 1 })
        }
      }
    }

    drawRef.current()
  }, [isPanelOpen, initialized, focusedParent])

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
              <p className="text-gray-400">Loading Portfolio...</p>
            </div>
          </div>
        )}

        {/* Back to Overview button - shown when focused but panel not open */}
        {!loading && focusedParent && !isPanelOpen && (
          <button
            onClick={returnToOverview}
            className="absolute top-4 right-4 px-4 py-2 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            style={{ background: 'rgba(20, 20, 20, 0.9)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <ArrowLeft size={16} />
            Overview
          </button>
        )}

        {/* Controls hint */}
        {!loading && !isPanelOpen && !focusedParent && (
          <div
            className="absolute bottom-4 right-4 px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-400"
            style={{ background: 'rgba(20, 20, 20, 0.9)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            {isMobile ? 'Tap category to focus · Pinch to zoom' : 'Click category to focus · Scroll to zoom'}
          </div>
        )}

        {/* Legend */}
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
                      {categoryPosts.map((post: BlogPost & { isProject?: boolean; projectData?: ProjectData }, index) => (
                        <button
                          key={post.id || `post-${index}`}
                          onClick={() => {
                            if (post.isProject && post.projectData) {
                              openProject(post.projectData)
                            } else {
                              openPost(post.slug)
                            }
                          }}
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
              ) : selectedProject ? (
                <article className="p-6">
                  {/* Project Image */}
                  {selectedProject.imageUrl && (
                    <div className="relative w-full h-32 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-6">
                      <img
                        src={selectedProject.imageUrl}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Category Badge */}
                  {selectedProject.category && (
                    <div className="mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-[#A23B72]">
                        {selectedProject.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {selectedProject.title}
                  </h1>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                    {selectedProject.primaryLanguage && (
                      <div className="flex items-center gap-1">
                        <Code size={14} />
                        <span>{selectedProject.primaryLanguage}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span>{selectedProject.starsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork size={14} />
                      <span>{selectedProject.forksCount}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProject.description && (
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  )}

                  {/* Technologies */}
                  {selectedProject.technologyNames && selectedProject.technologyNames.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedProject.technologyNames.map((tech, index) => (
                        <span
                          key={`tech-${index}`}
                          className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-800">
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                      >
                        <Github size={18} />
                        <span>View on GitHub</span>
                      </a>
                    )}
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        <ExternalLink size={18} />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </article>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Failed to load content
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
