"use client"

import { usePathname } from "next/navigation"
import Waves from "./waves"

export default function GlobalWavesBackground() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  console.log("🌊 GlobalWavesBackground: Rendering on path:", pathname, "isHomePage:", isHomePage)

  // Configuration for homepage (interactive) - Using Royal Purple from design system
  const homeConfig = {
    lineColor: "rgba(91, 44, 145, 0.3)", // Royal Purple: #5B2C91
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

  // Configuration for other pages (subtle, non-interactive) - Using Royal Purple from design system
  const otherPagesConfig = {
    lineColor: "rgba(91, 44, 145, 0.2)", // Royal Purple: #5B2C91, subtle opacity
    backgroundColor: "transparent",
    waveAmpX: 25,
    waveAmpY: 15,
    waveSpeedX: 0.01,
    waveSpeedY: 0.008,
    xGap: 20,
    yGap: 40,
    maxCursorMove: 0, // No cursor movement effect
    friction: 0.925,
    tension: 0.005,
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