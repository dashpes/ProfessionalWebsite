'use client'

// Note: metadata is handled by the parent layout due to client component requirements

import { useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Database, GraduationCap, MapPin, Sparkles } from 'lucide-react'
import Footer from "../components/footer"

const skills = [
  { name: "React/Next.js", level: 90, category: "Frontend" },
  { name: "TypeScript", level: 85, category: "Frontend" },
  { name: "Tailwind CSS", level: 90, category: "Frontend" },
  { name: "Node.js", level: 80, category: "Backend" },
  { name: "Python", level: 85, category: "Data" },
  { name: "Data Analysis", level: 85, category: "Data" },
  { name: "Machine Learning", level: 75, category: "Data" },
  { name: "Software Testing/QA", level: 80, category: "QA" },
  { name: "PostgreSQL", level: 75, category: "Tools" },
  { name: "Git/GitHub", level: 90, category: "Tools" }
]

const journey = [
  {
    year: "May 2025",
    title: "Google Advanced Data Analytics Certificate",
    description: "Advanced certification in data analytics and machine learning",
    icon: <Database className="w-6 h-6" />,
    color: "bg-white"
  },
  {
    year: "Summer 2025",
    title: "QA Software Engineer at Assa Abloy",
    description: "Starting new role in quality assurance and software testing",
    icon: <Code2 className="w-6 h-6" />,
    color: "bg-purple-400"
  },
  {
    year: "Fall 2025-2027",
    title: "Georgia Tech - Masters in Analytics",
    description: "Starting fall 2025 - Advanced analytics education, expected 2027",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "bg-purple-500"
  },
  {
    year: "Present",
    title: "Full Stack Development Expertise",
    description: "Proficiency in modern web technologies and frameworks",
    icon: <Sparkles className="w-6 h-6" />,
    color: "bg-purple-600"
  }
]

interface AnimatedSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

function AnimatedSection({ children, delay = 0, className = "" }: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function SkillBar({ skill, index }: { skill: typeof skills[0], index: number }) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true)
          // Delay before starting to fill
          setTimeout(() => {
            // Animate the progress incrementally
            const duration = 4000 // 4 seconds
            const steps = 40 // Number of steps in animation
            const increment = skill.level / steps
            const stepDuration = duration / steps
            
            let currentProgress = 0
            const interval = setInterval(() => {
              currentProgress += increment
              if (currentProgress >= skill.level) {
                currentProgress = skill.level
                clearInterval(interval)
                setHasAnimated(true) // Lock the animation
              }
              setProgress(Math.round(currentProgress))
            }, stepDuration)
          }, 800 + (index * 200))
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current && !hasAnimated) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [skill.level, index, hasAnimated])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Frontend': return {
        badge: 'text-emerald-600 border-emerald-600',
        progress: 'bg-emerald-500'
      }
      case 'Backend': return {
        badge: 'text-blue-600 border-blue-600',
        progress: 'bg-blue-500'
      }
      case 'Data': return {
        badge: 'text-orange-600 border-orange-600',
        progress: 'bg-orange-500'
      }
      case 'QA': return {
        badge: 'text-rose-600 border-rose-600',
        progress: 'bg-rose-500'
      }
      case 'Tools': return {
        badge: 'text-amber-600 border-amber-600',
        progress: 'bg-amber-500'
      }
      default: return {
        badge: 'text-gray-600 border-gray-600',
        progress: 'bg-gray-500'
      }
    }
  }

  return (
    <Card
      ref={ref}
      className={`border transition-all duration-500 delay-${index * 100} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-lg" style={{ color: '#2A2A2A' }}>{skill.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${getCategoryColor(skill.category).badge}`}>
              {skill.category}
            </Badge>
            <span className="text-sm font-medium" style={{ color: '#6B6B6B' }}>{progress}%</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${getCategoryColor(skill.category).progress}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineItem({ item, index }: { item: typeof journey[0], index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [index])

  return (
    <div
      ref={ref}
      className={`relative flex items-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      } ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
    >
      {/* Timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2" style={{ background: 'linear-gradient(to bottom, #5B2C91, #8B6DB8, rgba(255, 255, 255, 0.5))' }} />

      {/* Content */}
      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
        <Card
          className="border transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${item.color}`} style={{ color: '#F5F2E8' }}>
                {item.icon}
              </div>
              <div>
                <CardTitle className="text-lg" style={{ color: '#2A2A2A' }}>{item.title}</CardTitle>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>{item.year}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{ color: '#2A2A2A' }}>{item.description}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Center dot */}
      <div
        className={`absolute left-1/2 w-6 h-6 ${item.color} rounded-full transform -translate-x-1/2 z-10 transition-all duration-500 ${
          isVisible ? 'scale-100' : 'scale-0'
        }`}
        style={{ border: '4px solid #F5F2E8' }}
      />
    </div>
  )
}

export default function AboutPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'rgba(91, 44, 145, 0.1)',
            left: mousePosition.x * 0.1,
            top: mousePosition.y * 0.1,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            left: mousePosition.x * -0.05,
            top: mousePosition.y * -0.05,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-20">
            <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#5B2C91' }}>
              About Daniel Ashpes
            </h1>
            <div className="flex justify-center mb-8">
              <Card
                className="border inline-block"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
              >
                <CardContent className="px-6 py-3">
                  <div className="flex items-center gap-2" style={{ color: '#6B6B6B' }}>
                    <MapPin className="w-4 h-4" />
                    <span>QA Software Engineer at Assa Abloy • Georgia Tech MS Analytics (2027)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedSection>

        {/* Profile Section */}
        <AnimatedSection delay={200}>
          <section className="flex flex-col lg:flex-row items-center gap-12 mb-20">
            <div className="lg:w-1/3 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <Image
                  src="/daniel-ashpes-logo.png"
                  alt="Daniel Ashpes"
                  width={300}
                  height={300}
                  className="relative rounded-full object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="lg:w-2/3 text-center lg:text-left">
              <Card
                className="border"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
              >
                <CardContent className="p-8">
                  <AnimatedSection delay={400}>
                    <h2 className="text-3xl md:text-4xl font-semibold mb-6" style={{ color: '#5B2C91' }}>
                      Hello! I&apos;m Daniel Ashpes.
                    </h2>
                  </AnimatedSection>
                  <AnimatedSection delay={600}>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: '#2A2A2A' }}>
                      Crafting technical solutions with precision engineering. Specializing in React, Next.js, Python, and data-driven applications that perform under pressure.
                      I architect scalable systems that don&apos;t just function—they excel in production environments where milliseconds matter and reliability is non-negotiable.
                      My approach combines the rigorous methodology of a data scientist with the pragmatic execution of a seasoned engineer.
                    </p>
                  </AnimatedSection>
                  <AnimatedSection delay={800}>
                    <p className="text-lg leading-relaxed" style={{ color: '#2A2A2A' }}>
                      I transform complex business requirements into elegant technical solutions that scale. With a Google Advanced Data Analytics certification
                      and an upcoming Masters in Analytics from Georgia Tech, I bridge the gap between raw data and actionable intelligence. Whether it&apos;s
                      building full-stack applications that handle millions of requests or implementing ML pipelines that drive critical business decisions,
                      I deliver software that performs when it matters most. My code doesn&apos;t just work—it endures.
                    </p>
                  </AnimatedSection>
                </CardContent>
              </Card>
            </div>
          </section>
        </AnimatedSection>

        {/* Skills Section */}
        <AnimatedSection delay={200}>
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12" style={{ color: '#5B2C91' }}>
              Technical Skills
            </h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <SkillBar key={skill.name} skill={skill} index={index} />
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Journey Timeline */}
        <AnimatedSection delay={300}>
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16" style={{ color: '#5B2C91' }}>
              My Journey
            </h2>
            <div className="relative max-w-6xl mx-auto">
              <div className="space-y-12">
                {journey.map((item, index) => (
                  <TimelineItem key={`${item.year}-${item.title}`} item={item} index={index} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* What I Do */}
        <AnimatedSection delay={400}>
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-8" style={{ color: '#5B2C91' }}>
              What I Do
            </h2>
            <Card
              className="border transition-all duration-500"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-center max-w-4xl mx-auto" style={{ color: '#2A2A2A' }}>
                  I specialize in full-stack development, quality assurance, and data analytics. My expertise spans creating responsive
                  web applications, implementing comprehensive software testing strategies, and transforming complex data into actionable
                  insights. As a QA Software Engineer, I ensure software reliability while leveraging my development background to understand
                  systems holistically. I&apos;m passionate about combining traditional software engineering with modern data science techniques
                  to deliver robust, data-driven solutions.
                </p>
              </CardContent>
            </Card>
          </section>
        </AnimatedSection>

        {/* Future Goals */}
        <AnimatedSection delay={500}>
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-8" style={{ color: '#5B2C91' }}>
              Future Goals
            </h2>
            <Card
              className="border transition-all duration-500"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-center max-w-4xl mx-auto mb-6" style={{ color: '#2A2A2A' }}>
                  I am passionate about the future intersection of AI, software engineering, and data analytics. My goal is to integrate
                  artificial intelligence and machine learning into quality assurance processes, creating intelligent testing frameworks
                  that can predict and prevent software issues before they occur.
                </p>
                <p className="text-lg leading-relaxed text-center max-w-4xl mx-auto" style={{ color: '#2A2A2A' }}>
                  As I complete my Masters in Analytics at Georgia Tech, I aim to pioneer new approaches that combine traditional QA methodologies
                  with AI-powered insights, contributing to the evolution of smart software development practices. I envision building systems
                  that not only ensure software quality but also learn and adapt to improve development workflows through predictive analytics
                  and automated decision-making.
                </p>
              </CardContent>
            </Card>
          </section>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  )
}