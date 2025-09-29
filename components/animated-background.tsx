"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Waves from "./waves"

interface AnimatedBackgroundProps {
  className?: string
  children?: React.ReactNode
  intensity?: "subtle" | "normal" | "intense"
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = "",
  children,
  intensity = "normal"
}) => {
  const { theme } = useTheme()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  console.log("🌊 AnimatedBackground: Rendering with", { theme, intensity, prefersReducedMotion })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Different intensity configurations - Using Royal Purple from design system
  const intensityConfig = {
    subtle: {
      lineColor: "rgba(91, 44, 145, 0.15)", // Royal Purple: #5B2C91
      waveAmpX: 15,
      waveAmpY: 10,
      waveSpeedX: 0.006,
      waveSpeedY: 0.004,
      xGap: 30,
      yGap: 50,
      maxCursorMove: 50,
    },
    normal: {
      lineColor: "rgba(91, 44, 145, 0.25)", // Royal Purple: #5B2C91
      waveAmpX: 25,
      waveAmpY: 15,
      waveSpeedX: 0.01,
      waveSpeedY: 0.008,
      xGap: 20,
      yGap: 40,
      maxCursorMove: 80,
    },
    intense: {
      lineColor: "rgba(91, 44, 145, 0.35)", // Royal Purple: #5B2C91
      waveAmpX: 35,
      waveAmpY: 20,
      waveSpeedX: 0.015,
      waveSpeedY: 0.012,
      xGap: 15,
      yGap: 30,
      maxCursorMove: 100,
    }
  }

  // Theme-based color adjustments - Using Royal Purple from design system
  const themeConfig = {
    lineColor: theme === "light"
      ? "rgba(91, 44, 145, 0.2)" // Royal Purple for light theme: #5B2C91
      : intensityConfig[intensity].lineColor,
    backgroundColor: "transparent"
  }

  const waveConfig = {
    ...intensityConfig[intensity],
    ...themeConfig,
    friction: 0.925,
    tension: 0.005,
  }

  // Don't render waves if user prefers reduced motion
  if (prefersReducedMotion) {
    console.log("🌊 AnimatedBackground: Skipping waves due to reduced motion preference")
    return (
      <div className={`relative ${className}`} style={{ backgroundColor: "#F5F2E8" }}>
        {children}
      </div>
    )
  }

  console.log("🌊 AnimatedBackground: Rendering waves with config", waveConfig)

  return (
    <div className={`relative ${className}`} style={{ backgroundColor: "#F5F2E8" }}>
      {/* Background layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Waves
          {...waveConfig}
          className="w-full h-full"
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default AnimatedBackground