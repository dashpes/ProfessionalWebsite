"use client"

// Note: metadata is handled by the parent layout due to client component requirements

import { Project } from "@/lib/types"
import { Suspense, useState, useEffect, useRef } from "react"
import GitHubStatsCompact from "../components/github-stats-compact"
import ProjectProfileCard from "@/components/project-profile-card"

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {projects.map((project, index) => (
        <div
          key={project.id}
          ref={el => projectRefs.current[index] = el}
          className={`transition-all duration-700 ease-out ${
            visibleProjects.includes(index)
              ? 'opacity-100 transform translate-y-0 scale-100'
              : 'opacity-0 transform translate-y-8 scale-95'
          }`}
          style={{
            transitionDelay: visibleProjects.includes(index) ? '0ms' : `${index * 150}ms`
          }}
        >
          <ProjectProfileCard project={project} />
        </div>
      ))}
    </div>
  )
}

function ProjectsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-full max-w-[420px] mx-auto backdrop-blur-xl bg-white/90 border border-gray-200 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Image skeleton */}
          <div className="h-48 animate-pulse bg-gray-200" />

          {/* Content skeleton */}
          <div className="p-6 space-y-5">
            {/* Header skeleton */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>

            {/* Technologies skeleton */}
            <div className="flex flex-wrap gap-1.5">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
              ))}
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-4 gap-3 py-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="text-center space-y-1">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-8" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              ))}
            </div>

            {/* Info section skeleton */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2.5">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-2.5 pt-1">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Header Section */}
      <div className="mb-16">
        {/* Live Activity Widget and Content - Widget on Left, Text Content on Right */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="lg:flex-shrink-0">
            <GitHubStatsCompact />
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#5B2C91' }}>
              My Projects
            </h1>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: '#2A2A2A' }}>
              A comprehensive showcase of my technical work, from full-stack web applications to data science projects.
              Each project demonstrates different aspects of my expertise in modern development practices.
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
