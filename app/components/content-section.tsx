"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export default function ContentSection() {
  const paragraphText = "Crafting technical solutions with precision engineering. Specializing in React, Next.js, Python, and data-driven applications that perform under pressure."

  // State for scroll-triggered animations
  const [displayedParagraph, setDisplayedParagraph] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [currentPhase, setCurrentPhase] = useState("waiting")
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const animationTriggered = useRef(false)

  // Typewriter animation
  const typeText = (text: string, setter: (value: string) => void, delay: number = 30) => {
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

  const startContentAnimation = useCallback(async () => {
    // Prevent multiple animations from running
    if (hasAnimated || isAnimating || animationComplete) return

    setHasAnimated(true)
    setIsAnimating(true)

    try {
      // Delay before starting
      await new Promise(resolve => setTimeout(resolve, 500))

      // Type paragraph
      setCurrentPhase("paragraph")
      await typeText(paragraphText, setDisplayedParagraph, 20)
      await new Promise(resolve => setTimeout(resolve, 400))

      // Mark as complete
      setCurrentPhase("complete")
      setAnimationComplete(true)

      // Save to session storage so animation doesn't repeat
      sessionStorage.setItem('content-section-animated', 'true')
    } catch (error) {
      console.error("Animation error:", error)
      // Even if there's an error, prevent retriggering
      setAnimationComplete(true)
      sessionStorage.setItem('content-section-animated', 'true')
    } finally {
      setIsAnimating(false)
    }
  }, [hasAnimated, isAnimating, animationComplete, paragraphText])

  // Check session storage on mount to see if animation was already completed
  useEffect(() => {
    const wasCompleted = sessionStorage.getItem('content-section-animated')
    if (wasCompleted === 'true') {
      // Skip animation - show everything immediately
      setDisplayedParagraph(paragraphText)
      setCurrentPhase("complete")
      setHasAnimated(true)
      setAnimationComplete(true)
      setIsVisible(true)
      animationTriggered.current = true
    }
  }, [])

  // Intersection Observer to trigger animations when section comes into view
  useEffect(() => {
    // Don't create observer if animation was already completed or triggered
    if (animationComplete || hasAnimated || animationTriggered.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // Only trigger if we haven't animated yet AND we're not currently animating
        if (entry.isIntersecting && !animationTriggered.current && !hasAnimated && !isAnimating && !animationComplete) {
          animationTriggered.current = true
          setIsVisible(true)
          startContentAnimation()
          // Immediately disconnect the observer to prevent retriggering
          observer.disconnect()
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: "-100px 0px" // Trigger a bit after the section starts to appear
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [animationComplete, hasAnimated, isAnimating, startContentAnimation])

  // Cursor blinking effect
  useEffect(() => {
    if (!isVisible) return

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [isVisible])

  const getCursorPosition = () => {
    switch (currentPhase) {
      case "paragraph":
        return "paragraph"
      case "complete":
        return "none"
      default:
        return "none"
    }
  }

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-4 py-16 md:py-24 flex flex-col justify-center items-center"
    >
      <div className="w-full max-w-6xl mx-auto text-center">
        <p className="text-2xl md:text-3xl font-medium leading-relaxed" style={{color: '#1A1A1A'}}>
          {displayedParagraph}
          {getCursorPosition() === "paragraph" && (
            <span className={`inline-block w-1 h-7 md:h-8 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} style={{backgroundColor: '#1A1A1A'}} />
          )}
        </p>
      </div>
    </section>
  )
}