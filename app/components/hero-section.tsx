"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Global variable to track animation state across component mounts
let hasPlayedInSession = false

export default function HeroSection() {
  const nameText = "Daniel Ashpes"
  const subtitleText = "Full Stack Software Engineer & Data Scientist"

  // State for animation
  const [displayedName, setDisplayedName] = useState("")
  const [displayedSubtitle, setDisplayedSubtitle] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

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
      // Skip animation - show everything immediately
      setDisplayedName(nameText)
      setDisplayedSubtitle(subtitleText)
      setShowSubtitle(true)
      setShowButtons(true)
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
      // Type name first
      await typeText(nameText, setDisplayedName, 30)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Show and type subtitle
      setShowSubtitle(true)
      await typeText(subtitleText, setDisplayedSubtitle, 25)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Show buttons
      setShowButtons(true)
      await new Promise(resolve => setTimeout(resolve, 300))

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
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold leading-tight mb-6" style={{color: '#2A2A2A'}}>
          {displayedName}
          {!isComplete && !showSubtitle && (
            <span className={`inline-block w-1 h-12 sm:h-20 md:h-24 lg:h-28 ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'}`} style={{backgroundColor: '#2A2A2A'}} />
          )}
        </h1>
        {showSubtitle && (
          <h2 className="text-base sm:text-2xl md:text-4xl font-semibold leading-tight mb-8 px-4 sm:px-0" style={{color: '#5B2C91'}}>
            {displayedSubtitle}
            {!isComplete && showSubtitle && !showButtons && (
              <span className={`inline-block w-1 h-4 sm:h-6 md:h-8 ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'}`} style={{backgroundColor: '#5B2C91'}} />
            )}
          </h2>
        )}
        {showButtons && (
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ${
            showButtons ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[140px] sm:min-w-[160px]"
              >
                View My Work
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[140px] sm:min-w-[160px]"
              >
                Get to Know Me
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[140px] sm:min-w-[160px]"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
