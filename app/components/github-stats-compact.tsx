'use client'

import { useState, useEffect, useRef } from 'react'
import { GitFork, Star, Calendar, Code } from 'lucide-react'
import { useCounterAnimation } from '@/hooks/use-counter-animation'

interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  mostStarredRepo: {
    name: string
    stars: number
    description: string
    language: string
  } | null
  recentActivity: string
}

export default function GitHubStatsCompact() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Animated counters
  const animatedRepos = useCounterAnimation(stats?.totalRepos || 0, 1500, isVisible)
  const animatedStars = useCounterAnimation(stats?.totalStars || 0, 2000, isVisible)
  const animatedForks = useCounterAnimation(stats?.totalForks || 0, 2500, isVisible)

  useEffect(() => {
    fetchGitHubStats()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const fetchGitHubStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/github-stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Unable to load GitHub stats')
      console.error('GitHub stats error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse" />
            <div className="w-24 h-5 bg-gray-700 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
              <div className="w-8 h-6 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm font-medium text-white">GitHub Activity</span>
        </div>
        <p className="text-gray-400 text-sm">{error || 'Stats unavailable'}</p>
      </div>
    )
  }

  return (
    <div 
      ref={cardRef}
      className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-lg font-semibold text-white">Live Activity</span>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Repositories</span>
          </div>
          <div className="text-xl font-bold text-purple-400 transform group-hover:scale-110 transition-transform">
            {animatedRepos}
          </div>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Stars</span>
          </div>
          <div className="text-xl font-bold text-yellow-400 transform group-hover:scale-110 transition-transform">
            {animatedStars}
          </div>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Forks</span>
          </div>
          <div className="text-xl font-bold text-blue-400 transform group-hover:scale-110 transition-transform">
            {animatedForks}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>Updated {stats.recentActivity}</span>
        </div>
      </div>
    </div>
  )
}