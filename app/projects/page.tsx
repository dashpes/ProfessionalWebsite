"use client"

// Note: metadata is handled by the parent layout due to client component requirements

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Project } from "@/lib/types"
import { Suspense, useState, useEffect, useRef } from "react"
import GitHubStatsCompact from "../components/github-stats-compact"
import { ExternalLink, Github, Calendar, Code } from "lucide-react"

function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [visibleProjects, setVisibleProjects] = useState<number[]>([])
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Fetch projects from API endpoint
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const allProjects = await response.json()
          setProjects(allProjects)
        } else {
          console.error('Failed to fetch projects')
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const observers = projects.map((_, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleProjects(prev => [...prev, index])
          }
        },
        { threshold: 0.1 }
      )

      if (projectRefs.current[index]) {
        observer.observe(projectRefs.current[index])
      }

      return observer
    })

    return () => observers.forEach(observer => observer.disconnect())
  }, [projects])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <Card
          key={project.id}
          ref={el => projectRefs.current[index] = el}
          className={`border flex flex-col transition-all duration-700 ease-out ${
            visibleProjects.includes(index)
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
            transitionDelay: visibleProjects.includes(index) ? '0ms' : `${index * 250}ms`
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
              <div className="flex flex-col gap-2">
                {project.featured && (
                  <Badge className="bg-purple-600 text-white hover:bg-purple-700 text-xs">
                    ⭐ Featured
                  </Badge>
                )}
                {project.manual && (
                  <Badge variant="outline" className="border-purple-600 text-purple-600 text-xs">
                    📝 Manual
                  </Badge>
                )}
                {project.category && (
                  <Badge variant="outline" className="border-purple-600 text-purple-600 text-xs">
                    <Code className="w-3 h-3 mr-1" />
                    {project.category}
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription style={{ color: '#2A2A2A' }}>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B6B6B' }}>
                Technologies Used
              </h3>
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
            <div className="flex gap-2 mt-auto pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              {project.github && (
                <Link href={project.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                </Link>
              )}
              {project.live && (
                <Link href={project.live} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </Button>
                </Link>
              )}
            </div>
            {project.status && (
              <div className="flex items-center gap-2 text-sm mt-2" style={{ color: '#6B6B6B' }}>
                <Calendar className="w-4 h-4" />
                <span className="capitalize">{project.status.replace('-', ' ')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <Card
          key={i}
          className="border flex flex-col"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          }}
        >
          {/* Image skeleton */}
          <div className="h-48 rounded-t-lg animate-pulse" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />

          {/* Content skeleton */}
          <CardHeader>
            <div className="space-y-2">
              <div className="h-6 rounded animate-pulse w-3/4" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
              <div className="h-4 rounded animate-pulse w-full" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
              <div className="h-4 rounded animate-pulse w-2/3" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            {/* Technologies skeleton */}
            <div className="mb-4">
              <div className="h-4 rounded animate-pulse w-24 mb-3" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-6 w-16 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
                ))}
              </div>
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-2 mt-auto pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="h-8 w-20 rounded animate-pulse flex-1" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
              <div className="h-8 w-24 rounded animate-pulse flex-1" style={{ backgroundColor: 'rgba(91, 44, 145, 0.1)' }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#5B2C91' }}>
          My Projects
        </h1>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: '#2A2A2A' }}>
          A comprehensive showcase of my technical work, from full-stack web applications to data science projects.
          Each project demonstrates different aspects of my expertise in modern development practices.
        </p>

        {/* GitHub Stats - Centered below title */}
        <div className="mt-12 flex justify-center">
          <div className="max-w-lg w-full">
            <GitHubStatsCompact />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <Suspense fallback={<ProjectsLoading />}>
        <ProjectsGrid />
      </Suspense>
    </div>
  )
}
