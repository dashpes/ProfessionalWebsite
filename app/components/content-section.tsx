"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

export default function ContentSection() {
  const taglineText = "Passionate and results-driven Full Stack Developer and Data Scientist"
  const paragraphText = "Dedicated to crafting innovative and efficient digital solutions. With a strong foundation in both front-end and back-end technologies, coupled with a certification in Data Analysis, I bring a unique blend of technical expertise and analytical insight to every project."

  // State for scroll-triggered animations
  const [displayedTagline, setDisplayedTagline] = useState("")
  const [displayedParagraph, setDisplayedParagraph] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [currentPhase, setCurrentPhase] = useState("waiting")
  const [showButtons, setShowButtons] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)

  // Check session storage on mount to see if animation was already completed
  useEffect(() => {
    const wasCompleted = sessionStorage.getItem('content-section-animated')
    if (wasCompleted === 'true') {
      // Skip animation - show everything immediately
      setDisplayedTagline(taglineText)
      setDisplayedParagraph(paragraphText)
      setShowButtons(true)
      setShowLogo(true)
      setCurrentPhase("complete")
      setHasAnimated(true)
      setAnimationComplete(true)
      setIsVisible(true)
    }
  }, [])

  // Intersection Observer to trigger animations when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // Only trigger if we haven't animated yet AND we're not currently animating
        if (entry.isIntersecting && !hasAnimated && !isAnimating && !animationComplete) {
          setIsVisible(true)
          startContentAnimation()
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
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [hasAnimated, isAnimating, animationComplete])

  // Cursor blinking effect
  useEffect(() => {
    if (!isVisible) return

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [isVisible])

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

  const startContentAnimation = async () => {
    // Prevent multiple animations from running
    if (hasAnimated || isAnimating || animationComplete) return

    setHasAnimated(true)
    setIsAnimating(true)

    try {
      // Delay before starting
      await new Promise(resolve => setTimeout(resolve, 500))

      // Type tagline and show logo simultaneously
      setCurrentPhase("tagline")

      // Start logo fade-in when tagline starts typing
      setTimeout(() => {
        setShowLogo(true)
      }, 300) // Small delay so logo appears shortly after tagline starts

      await typeText(taglineText, setDisplayedTagline, 25)
      await new Promise(resolve => setTimeout(resolve, 600))

      // Type paragraph
      setCurrentPhase("paragraph")
      await typeText(paragraphText, setDisplayedParagraph, 20)
      await new Promise(resolve => setTimeout(resolve, 400))

      // Show buttons
      setCurrentPhase("buttons")
      setShowButtons(true)
      setCurrentPhase("complete")

      // Mark animation as fully complete
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
  }

  const getCursorPosition = () => {
    switch (currentPhase) {
      case "tagline":
        return "tagline"
      case "paragraph":
        return "paragraph"
      case "buttons":
      case "complete":
        return "paragraph"
      default:
        return "none"
    }
  }

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 min-h-screen"
    >
      <div className="md:w-1/2 text-center md:text-left">
        <h2 className="text-xl md:text-2xl text-purple-400 font-medium mb-8">
          {displayedTagline}
          {getCursorPosition() === "tagline" && (
            <span className={`inline-block w-1 h-6 md:h-7 bg-purple-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          {displayedParagraph}
          {getCursorPosition() === "paragraph" && (
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