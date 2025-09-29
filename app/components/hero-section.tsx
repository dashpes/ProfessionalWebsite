"use client"

import { useState, useEffect, useRef } from "react"

// Global variable to track animation state across component mounts
let hasPlayedInSession = false

export default function HeroSection() {
  const nameText = "Daniel Ashpes"

  // State for animation
  const [displayedName, setDisplayedName] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  // Ref to prevent double execution
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent double execution in strict mode or fast refresh
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Check if animation has played in this browser session
    const sessionPlayed = sessionStorage.getItem('hero-name-animation-played')

    // Check navigation type to determine if this is a refresh
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const isPageRefresh = navEntries.length > 0 && navEntries[0].type === 'reload'

    // If page is refreshed, reset the session flag
    if (isPageRefresh) {
      hasPlayedInSession = false
      sessionStorage.removeItem('hero-name-animation-played')
    }

    // Determine if we should skip animation
    const shouldSkip = hasPlayedInSession || sessionPlayed === 'true'

    if (shouldSkip) {
      // Skip animation - show name immediately
      setDisplayedName(nameText)
      setIsComplete(true)
      return
    }

    // Run the typewriter animation for name only
    const typeText = (text: string, setter: (value: string) => void, delay: number = 80) => {
      return new Promise<void>((resolve) => {
        let index = 0
        const timer = setInterval(() => {
          setter(text.slice(0, index + 1))
          index++
          if (index >= text.length) {
            clearInterval(timer)
            resolve()
          }
        }, delay)
      })
    }

    const startAnimation = async () => {
      // Type name only
      await typeText(nameText, setDisplayedName, 30)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mark as complete
      setIsComplete(true)
      hasPlayedInSession = true
      sessionStorage.setItem('hero-name-animation-played', 'true')
    }

    startAnimation()
  }, [])

  // Cursor blinking effect
  useEffect(() => {
    if (isComplete) return // Stop blinking when complete

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [isComplete])

  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight text-white">
          {displayedName}
          {!isComplete && (
            <span className={`inline-block w-1 h-20 md:h-24 lg:h-28 bg-white ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </h1>
      </div>
    </section>
  )
}
