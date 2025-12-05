"use client"

import { usePathname } from "next/navigation"
import Waves from "./waves"

export default function GlobalWavesBackground() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isAboutPage = pathname === "/about"
  const isProjectsPage = pathname === "/projects"
  const isBlogPage = pathname === "/blog" || pathname?.startsWith("/blog/")

  // Don't render waves on blog pages - they have their own graph visualization
  if (isBlogPage) {
    return null
  }

  console.log("🌊 GlobalWavesBackground: Rendering on path:", pathname, "isHomePage:", isHomePage, "isAboutPage:", isAboutPage, "isProjectsPage:", isProjectsPage)

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
    xGap: 15,
    yGap: 20,
    maxCursorMove: 120,
    friction: 0.88,
    tension: 0.008,
    interactive: true,
    particleMode: true,
    particleSize: 0.8,
    particleOpacity: 0.5
  }

  // Configuration for projects page (topographic mode) - Using Royal Purple from design system
  const projectsConfig = {
    lineColor: "rgba(91, 44, 145, 0.35)", // Royal Purple: #5B2C91
    backgroundColor: "#F5F2E8", // Cream background
    waveAmpX: 0,
    waveAmpY: 0,
    waveSpeedX: 0.01,
    waveSpeedY: 0.008,
    xGap: 15,
    yGap: 30,
    maxCursorMove: 0,
    friction: 0.925,
    tension: 0.005,
    interactive: true, // Enable cursor interaction with contours
    particleMode: false,
    topographicMode: true,
    contourLevels: 12,
    contourSpacing: 40
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

  const config = isHomePage ? homeConfig : isAboutPage ? aboutConfig : isProjectsPage ? projectsConfig : otherPagesConfig

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