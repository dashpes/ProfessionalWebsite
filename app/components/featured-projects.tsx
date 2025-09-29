"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Project } from "@/lib/types"
import { useState, useEffect, useRef } from "react"

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [titleVisible, setTitleVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Fallback projects for when database is unavailable
    const fallbackProjects: Project[] = [
      {
        id: "1",
        name: "Professional Portfolio Website",
        description: "A modern, responsive portfolio website built with Next.js 15, featuring animated backgrounds, dark/light themes, and comprehensive project showcase.",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
        githubUrl: "https://github.com/danielashpes/portfolio",
        liveUrl: "https://danielashpes.com",
        status: "ACTIVE" as const,
        featured: true,
        imageUrl: "/images/portfolio-preview.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: "Web Development",
        priority: 1
      },
      {
        id: "2",
        name: "E-Commerce Analytics Dashboard",
        description: "Full-stack analytics dashboard for e-commerce platforms with real-time data visualization, user behavior tracking, and performance metrics.",
        technologies: ["React", "Node.js", "Express", "MongoDB", "Chart.js"],
        githubUrl: "https://github.com/danielashpes/ecommerce-dashboard",
        status: "ACTIVE" as const,
        featured: true,
        imageUrl: "/images/dashboard-preview.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: "Full Stack",
        priority: 2
      },
      {
        id: "3",
        name: "AI-Powered Data Analysis Tool",
        description: "Machine learning application for automated data analysis and pattern recognition, featuring predictive modeling and data visualization.",
        technologies: ["Python", "TensorFlow", "Pandas", "Scikit-learn", "Flask"],
        githubUrl: "https://github.com/danielashpes/ai-data-tool",
        status: "ACTIVE" as const,
        featured: true,
        imageUrl: "/images/ai-tool-preview.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: "Data Science",
        priority: 3
      }
    ]

    // Fetch projects from API endpoint
    const fetchProjects = async () => {
      try {
        console.log('🚀 FeaturedProjects: Fetching projects from /api/projects/featured')
        const response = await fetch('/api/projects/featured')
        console.log('🚀 FeaturedProjects: Response status:', response.status, response.statusText)

        if (response.ok) {
          const featuredProjects = await response.json()
          console.log('🚀 FeaturedProjects: Fetched projects:', featuredProjects.length, 'projects')
          setProjects(featuredProjects)
        } else {
          console.log('🚀 FeaturedProjects: API failed, using fallback projects. Status:', response.status)
          setProjects(fallbackProjects)
        }
      } catch (error) {
        console.log('🚀 FeaturedProjects: Error fetching projects, using fallback:', error)
        setProjects(fallbackProjects)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // First show the title
            setTitleVisible(true)
            
            // Then animate cards one by one with staggered delays
            projects.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...prev, index])
              }, (index + 1) * 250) // 250ms delay between each project card
            })

            // Show button after all cards are visible
            setTimeout(() => {
              setButtonVisible(true)
            }, (projects.length + 1) * 250 + 500)
          } else {
            // Reset when scrolling back up
            setTitleVisible(false)
            setVisibleCards([])
            setButtonVisible(false)
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: "-50px 0px -50px 0px"
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [projects])

  return (
    <section ref={sectionRef} className="container mx-auto px-4 py-16 md:py-24">
      <h2 className={`text-3xl md:text-5xl font-bold text-center mb-12 transition-all duration-1000 ${
        titleVisible
          ? 'opacity-100 transform translate-y-0'
          : 'opacity-0 transform translate-y-8'
      }`} style={{ color: '#5B2C91' }}>
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Card
            key={project.id}
            className={`border flex flex-col transition-all duration-700 ease-out ${
              visibleCards.includes(index)
                ? 'opacity-100 transform translate-x-0 scale-100'
                : 'opacity-0 transform -translate-x-12 scale-95'
            }`}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              transitionDelay: visibleCards.includes(index) ? '0ms' : `${index * 150}ms`
            }}
          >
            {project.image && (
              <Image
                src={project.image}
                alt={project.title}
                width={600}
                height={400}
                className="rounded-t-lg object-cover w-full h-48"
              />
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl" style={{ color: '#2A2A2A' }}>{project.title}</CardTitle>
                {project.manual && (
                  <Badge variant="outline" className="border-purple-600 text-purple-600 text-xs">
                    Manual
                  </Badge>
                )}
              </div>
              <CardDescription style={{ color: '#2A2A2A' }}>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: '#5B2C91',
                        color: '#F5F2E8'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                {project.github && (
                  <Link href={project.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
                    >
                      GitHub
                    </Button>
                  </Link>
                )}
                {project.live && (
                  <Link href={project.live} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Live Demo
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className={`text-center mt-12 transition-all duration-1000 ${
        buttonVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-8'
      }`}>
        <Link href="/projects">
          <Button
            size="lg"
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
          >
            View All Projects
          </Button>
        </Link>
      </div>
    </section>
  )
}
