"use client"

// Note: metadata is handled by the parent layout due to client component requirements

import { Card } from "@/components/ui/card"
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
    <div className="space-y-8">
      {projects.map((project, index) => (
        <div
          key={project.id}
          ref={el => projectRefs.current[index] = el}
          className={`transform transition-all duration-700 ease-out ${
            visibleProjects.includes(index)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="bg-gray-900 border-gray-700 text-white overflow-hidden hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              {project.image && (
                <div className="lg:w-1/3 flex-shrink-0">
                  <div className="relative h-64 lg:h-full overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className={`flex-1 p-6 lg:p-8 ${!project.image ? 'lg:px-12' : ''}`}>
                <div className="flex flex-col h-full">
                  {/* Header with badges */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">
                        {project.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.featured && (
                          <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                            ⭐ Featured
                          </Badge>
                        )}
                        {project.manual && (
                          <Badge variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                            📝 Manual
                          </Badge>
                        )}
                        {project.category && (
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            <Code className="w-3 h-3 mr-1" />
                            {project.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-lg leading-relaxed mb-6 flex-grow">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, i: number) => (
                        <span 
                          key={i} 
                          className="bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 px-3 py-1.5 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-600 transition-all cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-700">
                    {project.github && (
                      <Link href={project.github} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent transition-all duration-200 flex items-center gap-2"
                        >
                          <Github className="w-4 h-4" />
                          View Code
                        </Button>
                      </Link>
                    )}
                    {project.live && (
                      <Link href={project.live} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </Button>
                      </Link>
                    )}
                    {project.status && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{project.status.replace('-', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

function ProjectsLoading() {
  return (
    <div className="space-y-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-gray-900 border-gray-700 text-white overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image skeleton */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="h-64 lg:h-full bg-gray-800 animate-pulse" />
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 p-6 lg:p-8">
              <div className="space-y-4">
                {/* Title and badges */}
                <div className="space-y-2">
                  <div className="h-8 bg-gray-800 rounded animate-pulse w-2/3" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                </div>
                
                {/* Technologies */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-32" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <div className="h-10 w-24 bg-gray-800 rounded animate-pulse" />
                  <div className="h-10 w-28 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 bg-black text-white">
      {/* Header Section with GitHub Stats */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16 pb-12 border-b border-gray-800">
        {/* GitHub Stats - Top Left */}
        <div className="lg:w-80 flex-shrink-0">
          <GitHubStatsCompact />
        </div>
        
        {/* Title - Centered on Right Side */}
        <div className="flex-1 text-center lg:flex lg:justify-center lg:items-center lg:mt-8">
          <div className="lg:text-center">
            <h1 className="text-4xl md:text-6xl font-bold">My Projects</h1>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
              A collection of my work, from full-stack applications to data analysis projects
            </p>
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
