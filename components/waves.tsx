"use client"

import type React from "react"
import { useRef, useEffect, type CSSProperties } from "react"

class Grad {
  x: number
  y: number
  z: number
  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
  dot2(x: number, y: number): number {
    return this.x * x + this.y * y
  }
}

class Noise {
  grad3: Grad[]
  p: number[]
  perm: number[]
  gradP: Grad[]
  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ]
    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
      21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
      237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
      111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216,
      80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186,
      3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
      17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193,
      238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128,
      195, 78, 66, 215, 61, 156, 180,
    ]
    this.perm = new Array(512)
    this.gradP = new Array(512)
    this.seed(seed)
  }

  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536
    seed = Math.floor(seed)
    if (seed < 256) seed |= seed << 8
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255)
      this.perm[i] = this.perm[i + 256] = v
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12]
    }
  }

  fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b
  }

  perlin2(x: number, y: number): number {
    let X = Math.floor(x),
      Y = Math.floor(y)
    x -= X
    y -= Y
    X &= 255
    Y &= 255
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y)
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1)
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y)
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1)
    const u = this.fade(x)
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y))
  }
}

interface Point {
  x: number
  y: number
  wave: { x: number; y: number }
  cursor: { x: number; y: number; vx: number; vy: number }
}

interface Mouse {
  x: number
  y: number
  lx: number
  ly: number
  sx: number
  sy: number
  v: number
  vs: number
  a: number
  set: boolean
}

interface Config {
  lineColor: string
  waveSpeedX: number
  waveSpeedY: number
  waveAmpX: number
  waveAmpY: number
  friction: number
  tension: number
  maxCursorMove: number
  xGap: number
  yGap: number
}

interface WavesProps {
  lineColor?: string
  backgroundColor?: string
  waveSpeedX?: number
  waveSpeedY?: number
  waveAmpX?: number
  waveAmpY?: number
  xGap?: number
  yGap?: number
  friction?: number
  tension?: number
  maxCursorMove?: number
  style?: CSSProperties
  className?: string
  interactive?: boolean // New prop to control mouse interaction
  particleMode?: boolean // New prop to enable particle rendering
  particleSize?: number // Size of particles when in particle mode
  particleOpacity?: number // Opacity of particles
  topographicMode?: boolean // New prop to enable topographic contour rendering
  contourLevels?: number // Number of elevation levels
  contourSpacing?: number // Distance between contour lines
}

const Waves: React.FC<WavesProps> = ({
  lineColor = "rgba(91, 44, 145, 0.3)", // Royal Purple: #5B2C91
  backgroundColor = "transparent",
  waveSpeedX = 0.01,
  waveSpeedY = 0.008,
  waveAmpX = 25,
  waveAmpY = 15,
  xGap = 20,
  yGap = 40,
  friction = 0.925,
  tension = 0.005,
  maxCursorMove = 80,
  style = {},
  className = "",
  interactive = true,
  particleMode = false,
  particleSize = 2,
  particleOpacity = 0.7,
  topographicMode = false,
  contourLevels = 8,
  contourSpacing = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const boundingRef = useRef<{
    width: number
    height: number
    left: number
    top: number
  }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  })
  const noiseRef = useRef(new Noise(Math.random()))
  const linesRef = useRef<Point[][]>([])
  const mouseRef = useRef<Mouse>({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  })
  const configRef = useRef<Config>({
    lineColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    xGap,
    yGap,
  })
  const frameIdRef = useRef<number | null>(null)
  const transitionRef = useRef({
    progress: particleMode ? 1 : 0,
    target: particleMode ? 1 : 0,
    duration: 1000,
    startTime: 0
  })

  useEffect(() => {
    configRef.current = {
      lineColor,
      waveSpeedX,
      waveSpeedY,
      waveAmpX,
      waveAmpY,
      friction,
      tension,
      maxCursorMove,
      xGap,
      yGap,
    }
  }, [lineColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove, xGap, yGap])

  // Handle transition when particleMode changes
  useEffect(() => {
    const transition = transitionRef.current
    transition.target = particleMode ? 1 : 0
    transition.startTime = performance.now()
  }, [particleMode])

  console.log("🌊 Waves: Component rendered with props", { lineColor, interactive, waveAmpX, waveAmpY })

  useEffect(() => {
    console.log("🌊 Waves: useEffect started", { lineColor, waveAmpX, waveAmpY, interactive })
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) {
      console.log("🌊 Waves: Missing canvas or container", { canvas: !!canvas, container: !!container })
      return
    }

    console.log("🌊 Waves: Setting up canvas and context")
    ctxRef.current = canvas.getContext("2d")

    function setSize() {
      if (!container || !canvas) return
      const rect = container.getBoundingClientRect()
      console.log("🌊 Waves: Setting size", { width: rect.width, height: rect.height })
      boundingRef.current = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      }
      canvas.width = rect.width
      canvas.height = rect.height
    }

    function setLines() {
      const { width, height } = boundingRef.current
      linesRef.current = []
      const oWidth = width + 200,
        oHeight = height + 30
      const { xGap, yGap } = configRef.current
      const totalLines = Math.ceil(oWidth / xGap)
      const totalPoints = Math.ceil(oHeight / yGap)
      const xStart = (width - xGap * totalLines) / 2
      const yStart = (height - yGap * totalPoints) / 2

      for (let i = 0; i <= totalLines; i++) {
        const pts: Point[] = []
        for (let j = 0; j <= totalPoints; j++) {
          pts.push({
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          })
        }
        linesRef.current.push(pts)
      }
    }

    function movePoints(time: number) {
      const lines = linesRef.current
      const mouse = mouseRef.current
      const noise = noiseRef.current
      const { waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, friction, tension, maxCursorMove } = configRef.current

      lines.forEach((pts) => {
        pts.forEach((p) => {
          if (particleMode) {
            // Particle-specific movement: more chaotic, independent motion
            const move = noise.perlin2((p.x + time * waveSpeedX) * 0.003, (p.y + time * waveSpeedY) * 0.002) * 15
            const move2 = noise.perlin2((p.x + time * waveSpeedX * 2.2) * 0.0008, (p.y + time * waveSpeedY * 1.8) * 0.0025) * 10
            const move3 = noise.perlin2((p.x + time * waveSpeedX * 0.5) * 0.004, (p.y + time * waveSpeedY * 0.6) * 0.001) * 6
            const drift = noise.perlin2((p.x + time * 0.002) * 0.001, (p.y + time * 0.0015) * 0.001) * 20

            p.wave.x = Math.cos(move + move3) * waveAmpX + Math.sin(move2 + drift) * (waveAmpX * 0.5)
            p.wave.y = Math.sin(move + move3) * waveAmpY + Math.cos(move2 + drift) * (waveAmpY * 0.6)
          } else {
            // Original wave movement
            const move = noise.perlin2((p.x + time * waveSpeedX) * 0.002, (p.y + time * waveSpeedY) * 0.0015) * 12
            const move2 = noise.perlin2((p.x + time * waveSpeedX * 1.5) * 0.001, (p.y + time * waveSpeedY * 1.3) * 0.002) * 8
            const move3 = noise.perlin2((p.x + time * waveSpeedX * 0.7) * 0.003, (p.y + time * waveSpeedY * 0.9) * 0.0012) * 4
            p.wave.x = Math.cos(move + move3) * waveAmpX + Math.sin(move2) * (waveAmpX * 0.3)
            p.wave.y = Math.sin(move + move3) * waveAmpY + Math.cos(move2) * (waveAmpY * 0.4)
          }

          // Only apply cursor interaction if interactive mode is enabled
          if (interactive) {
            const dx = p.x - mouse.sx,
              dy = p.y - mouse.sy
            const dist = Math.hypot(dx, dy)

            if (particleMode) {
              // Enhanced particle interaction: stronger repulsion and attraction
              const l = Math.max(200, mouse.vs * 2)
              if (dist < l) {
                const s = 1 - dist / l
                const f = Math.cos(dist * 0.0008) * s

                // Add some randomness to particle behavior
                const randomFactor = 1 + (Math.sin(time * 0.01 + p.x * 0.01) * 0.3)

                p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.001 * randomFactor
                p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.001 * randomFactor

                // Add perpendicular movement for more interesting particle behavior
                p.cursor.vx += Math.sin(mouse.a) * f * s * 0.5
                p.cursor.vy -= Math.cos(mouse.a) * f * s * 0.5
              }
            } else {
              // Original wave interaction
              const l = Math.max(175, mouse.vs)
              if (dist < l) {
                const s = 1 - dist / l
                const f = Math.cos(dist * 0.001) * s
                p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065
                p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065
              }
            }
          }

          p.cursor.vx += (0 - p.cursor.x) * tension
          p.cursor.vy += (0 - p.cursor.y) * tension
          p.cursor.vx *= friction
          p.cursor.vy *= friction
          p.cursor.x += p.cursor.vx * 2
          p.cursor.y += p.cursor.vy * 2
          p.cursor.x = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.x))
          p.cursor.y = Math.min(maxCursorMove, Math.max(-maxCursorMove, p.cursor.y))
        })
      })
    }

    function moved(point: Point, withCursor = true): { x: number; y: number } {
      const x = point.x + point.wave.x + (withCursor ? point.cursor.x : 0)
      const y = point.y + point.wave.y + (withCursor ? point.cursor.y : 0)
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
    }

    function drawTopographic() {
      const { width, height } = boundingRef.current
      const ctx = ctxRef.current
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      const noise = noiseRef.current
      const cellSize = 8 // Grid cell size for marching squares
      const cols = Math.ceil(width / cellSize) + 1
      const rows = Math.ceil(height / cellSize) + 1

      // Generate elevation field
      const field: number[][] = []
      const mouse = mouseRef.current

      for (let i = 0; i < cols; i++) {
        field[i] = []
        for (let j = 0; j < rows; j++) {
          const x = i * cellSize
          const y = j * cellSize

          // Multi-octave noise for more organic terrain
          let elevation =
            noise.perlin2(x * 0.003, y * 0.003) * 1.0 +
            noise.perlin2(x * 0.006, y * 0.006) * 0.5 +
            noise.perlin2(x * 0.012, y * 0.012) * 0.25

          // Normalize
          elevation = elevation / 1.75

          // Add cursor influence if interactive
          if (interactive) {
            const dx = x - mouse.sx
            const dy = y - mouse.sy
            const dist = Math.hypot(dx, dy)
            const influenceRadius = 250

            if (dist < influenceRadius) {
              const strength = Math.pow(1 - dist / influenceRadius, 2) * 0.4
              elevation += strength
            }
          }

          field[i][j] = elevation
        }
      }

      // Draw contour lines using marching squares
      for (let level = 0; level < contourLevels; level++) {
        const isoValue = (level / (contourLevels - 1)) * 2 - 1 // Range from -1 to 1

        // Major contour lines every 3 levels
        const isMajor = level % 3 === 0
        const lineWidth = isMajor ? 1.8 : 0.9
        const opacity = isMajor ? 0.45 : 0.28

        ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${opacity})`)
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // March through the grid
        for (let i = 0; i < cols - 1; i++) {
          for (let j = 0; j < rows - 1; j++) {
            const x = i * cellSize
            const y = j * cellSize

            // Get corner values
            const v0 = field[i][j]
            const v1 = field[i + 1][j]
            const v2 = field[i + 1][j + 1]
            const v3 = field[i][j + 1]

            // Determine which edges the contour crosses
            const edges: Array<{x: number, y: number}>[] = []

            // Check each edge
            if ((v0 < isoValue && v1 >= isoValue) || (v0 >= isoValue && v1 < isoValue)) {
              const t = (isoValue - v0) / (v1 - v0)
              edges.push([{x: x + t * cellSize, y: y}])
            }

            if ((v1 < isoValue && v2 >= isoValue) || (v1 >= isoValue && v2 < isoValue)) {
              const t = (isoValue - v1) / (v2 - v1)
              const point = {x: x + cellSize, y: y + t * cellSize}
              if (edges.length > 0) {
                edges[edges.length - 1].push(point)
              } else {
                edges.push([point])
              }
            }

            if ((v3 < isoValue && v2 >= isoValue) || (v3 >= isoValue && v2 < isoValue)) {
              const t = (isoValue - v3) / (v2 - v3)
              const point = {x: x + t * cellSize, y: y + cellSize}
              if (edges.length > 0) {
                edges[edges.length - 1].push(point)
              } else {
                edges.push([point])
              }
            }

            if ((v0 < isoValue && v3 >= isoValue) || (v0 >= isoValue && v3 < isoValue)) {
              const t = (isoValue - v0) / (v3 - v0)
              const point = {x: x, y: y + t * cellSize}
              if (edges.length > 0) {
                edges[edges.length - 1].push(point)
              } else {
                edges.push([point])
              }
            }

            // Draw line segments
            edges.forEach(segment => {
              if (segment.length === 2) {
                ctx.beginPath()
                ctx.moveTo(segment[0].x, segment[0].y)
                ctx.lineTo(segment[1].x, segment[1].y)
                ctx.stroke()
              }
            })
          }
        }
      }
    }

    function drawLines() {
      const { width, height } = boundingRef.current
      const ctx = ctxRef.current
      if (!ctx) return

      // If topographic mode, use different rendering
      if (topographicMode) {
        drawTopographic()
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Update transition progress
      const transition = transitionRef.current
      const now = performance.now()
      const elapsed = now - transition.startTime
      const progress = Math.min(elapsed / transition.duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease-out cubic

      transition.progress += (transition.target - transition.progress) * (0.1 + easeProgress * 0.05)

      const currentProgress = transition.progress

      if (currentProgress > 0.99) {
        // Pure particle mode
        ctx.fillStyle = lineColor.replace('rgba(', 'rgba(').replace(/[\d.]+\)$/, `${particleOpacity})`)

        linesRef.current.forEach((points) => {
          points.forEach((p) => {
            const pos = moved(p, true)
            const speed = Math.hypot(p.cursor.vx, p.cursor.vy)
            const sizeVariation = 1 + speed * 0.01
            const currentSize = particleSize * sizeVariation

            ctx.beginPath()
            ctx.arc(pos.x, pos.y, currentSize, 0, Math.PI * 2)
            ctx.fill()
          })
        })
      } else if (currentProgress < 0.01) {
        // Pure line mode
        ctx.beginPath()
        ctx.strokeStyle = configRef.current.lineColor
        linesRef.current.forEach((points) => {
          let p1 = moved(points[0], false)
          ctx.moveTo(p1.x, p1.y)
          points.forEach((p, idx) => {
            const isLast = idx === points.length - 1
            p1 = moved(p, !isLast)
            const p2 = moved(points[idx + 1] || points[points.length - 1], !isLast)
            ctx.lineTo(p1.x, p1.y)
            if (isLast) ctx.moveTo(p2.x, p2.y)
          })
        })
        ctx.stroke()
      } else {
        // Transition mode: blend lines and particles
        const lineOpacity = 1 - currentProgress
        const particleOpacity = currentProgress

        // Draw fading lines
        if (lineOpacity > 0) {
          ctx.beginPath()
          ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${lineOpacity * 0.3})`)
          linesRef.current.forEach((points) => {
            let p1 = moved(points[0], false)
            ctx.moveTo(p1.x, p1.y)
            points.forEach((p, idx) => {
              const isLast = idx === points.length - 1
              p1 = moved(p, !isLast)
              const p2 = moved(points[idx + 1] || points[points.length - 1], !isLast)
              ctx.lineTo(p1.x, p1.y)
              if (isLast) ctx.moveTo(p2.x, p2.y)
            })
          })
          ctx.stroke()
        }

        // Draw appearing particles
        if (particleOpacity > 0) {
          ctx.fillStyle = lineColor.replace(/[\d.]+\)$/, `${particleOpacity * 0.7})`)
          linesRef.current.forEach((points) => {
            points.forEach((p) => {
              const pos = moved(p, true)
              const speed = Math.hypot(p.cursor.vx, p.cursor.vy)
              const sizeVariation = 1 + speed * 0.01
              const currentSize = (particleSize * sizeVariation) * particleOpacity

              ctx.beginPath()
              ctx.arc(pos.x, pos.y, currentSize, 0, Math.PI * 2)
              ctx.fill()
            })
          })
        }
      }
    }

    function tick(t: number) {
      if (!container) return
      const mouse = mouseRef.current
      mouse.sx += (mouse.x - mouse.sx) * 0.1
      mouse.sy += (mouse.y - mouse.sy) * 0.1
      const dx = mouse.x - mouse.lx,
        dy = mouse.y - mouse.ly
      const d = Math.hypot(dx, dy)
      mouse.v = d
      mouse.vs += (d - mouse.vs) * 0.1
      mouse.vs = Math.min(100, mouse.vs)
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      mouse.a = Math.atan2(dy, dx)

      container.style.setProperty("--x", `${mouse.sx}px`)
      container.style.setProperty("--y", `${mouse.sy}px`)

      movePoints(t)
      drawLines()
      frameIdRef.current = requestAnimationFrame(tick)
    }

    function onResize() {
      // Delay to ensure viewport has updated (especially for orientation changes)
      setTimeout(() => {
        setSize()
        setLines()
      }, 100)
    }

    function onOrientationChange() {
      // Give more time for orientation change to settle
      setTimeout(() => {
        setSize()
        setLines()
      }, 300)
    }

    function onMouseMove(e: MouseEvent) {
      updateMouse(e.clientX, e.clientY)
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      updateMouse(touch.clientX, touch.clientY)
    }

    function updateMouse(x: number, y: number) {
      const mouse = mouseRef.current
      const b = boundingRef.current
      mouse.x = x - b.left
      mouse.y = y - b.top
      if (!mouse.set) {
        mouse.sx = mouse.x
        mouse.sy = mouse.y
        mouse.lx = mouse.x
        mouse.ly = mouse.y
        mouse.set = true
      }
    }

    setSize()
    setLines()
    frameIdRef.current = requestAnimationFrame(tick)

    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onOrientationChange)

    // Only add mouse/touch listeners if interactive
    if (interactive) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("touchmove", onTouchMove, { passive: false })
    }

    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onOrientationChange)
      if (interactive) {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("touchmove", onTouchMove)
      }
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [interactive, lineColor, particleMode, particleOpacity, particleSize, waveAmpX, waveAmpY, topographicMode, contourLevels, contourSpacing]) // Add missing dependencies

  return (
    <div
      ref={containerRef}
      className={`waves ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor,
        ...style,
      }}
    >
      <canvas ref={canvasRef} className="waves-canvas" />
    </div>
  )
}

export default Waves