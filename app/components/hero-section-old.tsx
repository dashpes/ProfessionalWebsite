"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HeroSection() {
  const nameText = "Daniel Ashpes"
  const taglineText = "Passionate and results-driven Full Stack Developer and Data Analyst"
  const paragraphText = "Dedicated to crafting innovative and efficient digital solutions. With a strong foundation in both front-end and back-end technologies, coupled with a certification in Data Analysis, I bring a unique blend of technical expertise and analytical insight to every project."

  // Initialize state with empty values - will be set in useEffect
  const [displayedName, setDisplayedName] = useState("")
  const [displayedTagline, setDisplayedTagline] = useState("")
  const [displayedParagraph, setDisplayedParagraph] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [currentPhase, setCurrentPhase] = useState("name")
  const [showButtons, setShowButtons] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)

  // Initial mount effect - check if we should skip animation
  useEffect(() => {
    // Check if animation has already played during this session
    const animationPlayed = sessionStorage.getItem('hero-animation-played')
    
    // Reset animation on hard refresh
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      sessionStorage.removeItem('hero-animation-played')
    }
    
    const shouldSkipAnimation = sessionStorage.getItem('hero-animation-played') === 'true'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Hero Section Init:', {
        animationPlayed,
        shouldSkipAnimation,
        navType: navEntries[0]?.type || 'unknown'
      })
    }
    
    if (shouldSkipAnimation) {
      // Skip animation, show everything immediately
      setDisplayedName(nameText)
      setDisplayedTagline(taglineText)
      setDisplayedParagraph(paragraphText)
      setCurrentPhase("done")
      setShowButtons(true)
      setShowLogo(true)
      setHasAnimated(true)
      setShouldAnimate(false)
      setIsInitialized(true)
    } else {
      // Allow animation to proceed
      setShouldAnimate(true)
      setIsInitialized(true)
    }
  }, [])

  // Animation effect - only runs when shouldAnimate is true and component is initialized
  useEffect(() => {
    if (!isInitialized || !shouldAnimate) {
      return
    }

    // Run the typewriter animation
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
      // Type name
      setCurrentPhase("name")
      await typeText(nameText, setDisplayedName, 100)
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause

      // Type tagline
      setCurrentPhase("tagline")
      await typeText(taglineText, setDisplayedTagline, 60)
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause

      // Type paragraph
      setCurrentPhase("paragraph")
      await typeText(paragraphText, setDisplayedParagraph, 40)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Show buttons
      setCurrentPhase("done")
      setShowButtons(true)
      
      // Show logo after buttons (with a slight delay)
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowLogo(true)
      
      // Mark animation as completed for this session
      sessionStorage.setItem('hero-animation-played', 'true')
      setHasAnimated(true)
    }

    startAnimation()
  }, [isInitialized, shouldAnimate])

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [])

  const getCursorPosition = () => {
    // If animation was skipped (returning from another page), always show cursor at paragraph
    if (hasAnimated && currentPhase === "done") {
      return "paragraph"
    }
    
    // During animation, show cursor based on current phase
    switch (currentPhase) {
      case "name":
        return "name"
      case "tagline":
        return "tagline"
      case "paragraph":
        return "paragraph"
      case "done":
        return "paragraph"
      default:
        return "name"
    }
  }

  return (
    <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
      <div className="md:w-1/2 text-center md:text-left">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          {displayedName}
          {getCursorPosition() === "name" && currentPhase === "name" && (
            <span className={`inline-block w-1 h-16 md:h-20 bg-white ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </h1>
        <h2 className="text-xl md:text-2xl text-purple-400 font-medium mb-8">
          {displayedTagline}
          {getCursorPosition() === "tagline" && currentPhase === "tagline" && (
            <span className={`inline-block w-1 h-6 md:h-7 bg-purple-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          {displayedParagraph}
          {(getCursorPosition() === "paragraph" && (currentPhase === "paragraph" || currentPhase === "done")) && (
            <span className={`inline-block w-1 h-5 md:h-6 bg-gray-300 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </p>
        <div className={`flex flex-col sm:flex-row gap-4 justify-center md:justify-start transition-all duration-1000 ${
          showButtons ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}>
          <Link href="/projects">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300"
            >
              View My Work
            </Button>
          </Link>
          <Link href="/about">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300"
            >
              Get to Know Me
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300"
            >
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
      <div className="md:w-1/2 flex justify-center items-center">
        <Image
          src="/daniel-ashpes-logo.png"
          alt="Daniel Ashpes Logo"
          width={500}
          height={500}
          className={`rounded-lg shadow-lg transition-all duration-1000 ease-out ${
            showLogo 
              ? 'opacity-100 transform translate-x-0 scale-100' 
              : 'opacity-0 transform translate-x-8 scale-95'
          }`}
          priority
        />
      </div>
    </section>
  )
}
