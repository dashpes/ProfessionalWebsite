"use client"

import { usePathname } from "next/navigation"
import Waves from "./waves"
import SimpleWavesTest from "./simple-waves-test"

export default function GlobalWavesBackground() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  console.log("🌊 GlobalWavesBackground: Rendering on path:", pathname, "isHomePage:", isHomePage)

  // Configuration for homepage (interactive)
  const homeConfig = {
    lineColor: "rgba(139, 92, 246, 0.25)",
    backgroundColor: "transparent",
    waveAmpX: 25,
    waveAmpY: 15,
    waveSpeedX: 0.01,
    waveSpeedY: 0.008,
    xGap: 20,
    yGap: 40,
    maxCursorMove: 80,
    friction: 0.925,
    tension: 0.005,
    interactive: true
  }

  // Configuration for other pages (subtle, non-interactive) - DEBUGGING WITH HIGH VISIBILITY
  const otherPagesConfig = {
    lineColor: "rgba(139, 92, 246, 0.8)", // VERY HIGH opacity for debugging
    backgroundColor: "transparent",
    waveAmpX: 40, // Large amplitude for visibility
    waveAmpY: 25,
    waveSpeedX: 0.015, // Fast movement for debugging
    waveSpeedY: 0.012,
    xGap: 15, // Tight spacing for visibility
    yGap: 30,
    maxCursorMove: 0, // No cursor movement effect
    friction: 0.95,
    tension: 0.002,
    interactive: false
  }

  const config = isHomePage ? homeConfig : otherPagesConfig

  console.log("🌊 GlobalWavesBackground: Using config:", config)

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Waves
        {...config}
        className="w-full h-full"
      />
    </div>
  )
}