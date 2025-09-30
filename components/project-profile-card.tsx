"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Github,
  ExternalLink,
  Globe,
  Code,
  Eye,
  Heart,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProjectProfile {
  id: string
  title: string
  description: string
  image?: string
  technologies: string[]
  github?: string
  live?: string
  featured?: boolean
  manual?: boolean
  status?: string
  category?: string
  stars?: number
  forks?: number
  language?: string
  size?: number
}

interface ProjectProfileCardProps {
  project: ProjectProfile
}

export default function ProjectProfileCard({ project }: ProjectProfileCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [stats, setStats] = useState({ viewCount: 0, likeCount: 0 })
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Load like status from localStorage and server on mount
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        // Check localStorage first for immediate UI feedback
        const localLiked = localStorage.getItem(`project-liked-${project.id}`) === 'true'
        setIsLiked(localLiked)

        // Then verify with server
        const response = await fetch(`/api/projects/${project.id}/like`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.liked)
          // Sync localStorage with server
          localStorage.setItem(`project-liked-${project.id}`, String(data.liked))
        }
      } catch (error) {
        console.error('Failed to load like status:', error)
      }
    }

    loadLikeStatus()
  }, [project.id])

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`/api/projects/${project.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load project stats:', error)
      }
    }

    loadStats()
  }, [project.id])

  // Track view when card becomes visible
  useEffect(() => {
    if (!cardRef.current || hasTrackedView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView) {
          // Track view
          fetch(`/api/projects/${project.id}/view`, {
            method: 'POST',
          }).then(() => {
            setHasTrackedView(true)
            // Update local stats
            setStats(prev => ({ ...prev, viewCount: prev.viewCount + 1 }))
          }).catch(error => {
            console.error('Failed to track view:', error)
          })
        }
      },
      { threshold: 0.5 } // Track when 50% of card is visible
    )

    observer.observe(cardRef.current)

    return () => observer.disconnect()
  }, [project.id, hasTrackedView])

  const handleLike = async () => {
    const newLikedState = !isLiked

    // Optimistic UI update
    setIsLiked(newLikedState)
    setStats(prev => ({
      ...prev,
      likeCount: newLikedState ? prev.likeCount + 1 : prev.likeCount - 1
    }))
    localStorage.setItem(`project-liked-${project.id}`, String(newLikedState))

    try {
      const response = await fetch(`/api/projects/${project.id}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        localStorage.setItem(`project-liked-${project.id}`, String(data.liked))

        // Refresh stats to ensure accuracy
        const statsResponse = await fetch(`/api/projects/${project.id}/stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } else {
        // Revert on error
        setIsLiked(!newLikedState)
        setStats(prev => ({
          ...prev,
          likeCount: !newLikedState ? prev.likeCount + 1 : prev.likeCount - 1
        }))
        localStorage.setItem(`project-liked-${project.id}`, String(!newLikedState))
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // Revert on error
      setIsLiked(!newLikedState)
      setStats(prev => ({
        ...prev,
        likeCount: !newLikedState ? prev.likeCount + 1 : prev.likeCount - 1
      }))
      localStorage.setItem(`project-liked-${project.id}`, String(!newLikedState))
    }
  }

  const handleWatch = () => {
    setIsWatching(!isWatching)
  }

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const kb = bytes / 1024
    if (kb < 1024) return `${Math.round(kb)}KB`
    return `${(kb / 1024).toFixed(1)}MB`
  }

  return (
    <div ref={cardRef} className="w-full h-full flex flex-col max-w-[420px] mx-auto backdrop-blur-xl bg-white/90 border border-gray-200 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.01] hover:bg-white hover:border-gray-300 shadow-2xl">
      {/* Project Image */}
      {project.image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {project.featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-yellow-500/90 text-black font-semibold text-xs px-2 py-1">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Project Content */}
      <div className="p-6 space-y-5 flex-1 flex flex-col">
        {/* Project Name and Category */}
        <div className="mb-3">
          <div className="flex items-start gap-4">
            {/* Project Icon/Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border-3 border-gray-300 bg-gray-100 backdrop-blur-xl shadow-lg flex items-center justify-center">
                <Code className="h-8 w-8 text-gray-700" />
              </div>
            </div>

            {/* Name, Description, and Primary Action */}
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold text-gray-900 leading-tight">{project.title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 text-sm font-medium">
                    {project.language ? `${project.language} Project` : 'Project'}
                  </p>
                  {/* Category Badge inline */}
                  {project.category && (
                    <Badge className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-700 text-xs px-2 py-0.5 transition-all duration-300 font-medium">
                      {project.category}
                    </Badge>
                  )}
                </div>
              </div>

              {project.github && (
                <Button
                  asChild
                  size="sm"
                  className="bg-gray-800/80 hover:bg-gray-700 text-white font-medium transition-all duration-300 hover:scale-[1.02] shadow-md text-xs px-3 py-1.5 h-auto"
                >
                  <Link href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3 w-3 mr-1.5" />
                    View on GitHub
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="min-h-[60px]">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{project.description}</p>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <Badge
              key={index}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-700 text-xs px-2.5 py-1 transition-all duration-300 font-medium"
            >
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge
              className="bg-gray-100 border border-gray-300 text-gray-600 text-xs px-2.5 py-1"
            >
              +{project.technologies.length - 4} more
            </Badge>
          )}
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-4 gap-3 py-2">
          <div className="text-center space-y-1">
            <p className="text-gray-900 font-semibold text-base">{formatNumber(project.stars)}</p>
            <p className="text-gray-500 text-xs font-medium">Stars</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-gray-900 font-semibold text-base">{formatNumber(project.forks)}</p>
            <p className="text-gray-500 text-xs font-medium">Forks</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-gray-900 font-semibold text-base">{project.language?.slice(0, 2) || "JS"}</p>
            <p className="text-gray-500 text-xs font-medium">Lang</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-gray-900 font-semibold text-base">{formatSize(project.size)}</p>
            <p className="text-gray-500 text-xs font-medium">Size</p>
          </div>
        </div>

        {/* Project Info */}
        <div className="space-y-2.5 bg-gray-50 rounded-xl p-4 border border-gray-200 flex-1">
          <div className="flex items-center gap-3 text-gray-700 text-sm">
            <Code className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="font-medium">{project.language || 'Multiple Languages'}</span>
          </div>

          {project.status && (
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium capitalize">{project.status.replace('-', ' ')}</span>
            </div>
          )}

          {project.github && (
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <Github className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium truncate">
                {project.github.replace('https://github.com/', '')}
              </span>
            </div>
          )}

          {project.live && (
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium truncate">Live Demo Available</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1 mt-auto">
          {project.live && (
            <Button
              asChild
              className="flex-1 bg-blue-500 hover:bg-blue-600 border-0 text-white font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <Link href={project.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Demo
              </Link>
            </Button>
          )}

          <Button
            onClick={handleWatch}
            className={`flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 text-gray-700 transition-all duration-300 hover:scale-[1.02] shadow-md ${
              isWatching ? "bg-blue-100 border-blue-300 text-blue-700" : ""
            }`}
            title={`${formatNumber(stats.viewCount)} views`}
          >
            <Eye className={`h-4 w-4 transition-colors duration-300 ${isWatching ? "text-blue-600" : ""}`} />
            <span className="text-xs font-medium">{formatNumber(stats.viewCount)}</span>
          </Button>

          <Button
            onClick={handleLike}
            className={`flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 text-gray-700 transition-all duration-300 hover:scale-[1.02] shadow-md ${
              isLiked ? "bg-red-100 border-red-300 text-red-700" : ""
            }`}
            title={`${formatNumber(stats.likeCount)} likes`}
          >
            <Heart className={`h-4 w-4 transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="text-xs font-medium">{formatNumber(stats.likeCount)}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}