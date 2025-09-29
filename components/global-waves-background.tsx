"use client"

import { usePathname } from "next/navigation"
import Waves from "./waves"

export default function GlobalWavesBackground() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isAboutPage = pathname === "/about"

  console.log("🌊 GlobalWavesBackground: Rendering on path:", pathname, "isHomePage:", isHomePage, "isAboutPage:", isAboutPage)

  // Configuration for homepage (interactive) - Using Royal Purple from design system
  const homeConfig = {
    lineColor: "rgba(91, 44, 145, 0.3)", // Royal Purple: #5B2C91
    backgroundColor: "#F5F2E8", // Cream background
    waveAmpX: 30,
    waveAmpY: 20,
    waveSpeedX: 0.015,
    waveSpeedY: 0.012,
    xGap: 12,
    yGap: 25,
    maxCursorMove: 80,
    friction: 0.925,
    tension: 0.005,
    interactive: true,
    particleMode: false
  }

  // Configuration for about page (particle mode) - Using Royal Purple from design system
  const aboutConfig = {
    lineColor: "rgba(91, 44, 145, 0.3)", // Royal Purple: #5B2C91, matches main page opacity
    backgroundColor: "#F5F2E8", // Cream background
    waveAmpX: 40,
    waveAmpY: 30,
    waveSpeedX: 0.008,
    waveSpeedY: 0.006,
    xGap: 5,
    yGap: 8,
    maxCursorMove: 120,
    friction: 0.88,
    tension: 0.008,
    interactive: true,
    particleMode: true,
    particleSize: 0.8,
    particleOpacity: 0.5
  }

  // Configuration for other pages (subtle, non-interactive) - Using Royal Purple from design system
  const otherPagesConfig = {
    lineColor: "rgba(91, 44, 145, 0.2)", // Royal Purple: #5B2C91, subtle opacity
    backgroundColor: "#F5F2E8", // Cream background
    waveAmpX: 20,
    waveAmpY: 15,
    waveSpeedX: 0.012,
    waveSpeedY: 0.01,
    xGap: 15,
    yGap: 30,
    maxCursorMove: 0, // No cursor movement effect
    friction: 0.925,
    tension: 0.005,
    interactive: false,
    particleMode: false
  }

  const config = isHomePage ? homeConfig : isAboutPage ? aboutConfig : otherPagesConfig

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