"use client"

import { useEffect, useRef } from "react"

export default function SimpleWavesTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  console.log("🌊 SimpleWavesTest: Component rendered")

  useEffect(() => {
    console.log("🌊 SimpleWavesTest: useEffect started")
    const canvas = canvasRef.current
    if (!canvas) {
      console.log("🌊 SimpleWavesTest: No canvas found")
      return
    }

    console.log("🌊 SimpleWavesTest: Setting up canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.log("🌊 SimpleWavesTest: No context found")
      return
    }

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    console.log("🌊 SimpleWavesTest: Canvas size set to", canvas.width, "x", canvas.height)

    // Draw a simple test pattern
    ctx.strokeStyle = "rgba(139, 92, 246, 0.8)"
    ctx.lineWidth = 2

    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * 50)
      ctx.lineTo(canvas.width, i * 50)
      ctx.stroke()
    }

    console.log("🌊 SimpleWavesTest: Test lines drawn")
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: "block",
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  )
}