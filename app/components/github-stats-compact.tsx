'use client'

import { useState, useEffect, useRef } from 'react'
import { GitFork, Star, Calendar, Code } from 'lucide-react'
import { useCounterAnimation } from '@/hooks/use-counter-animation'

interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  totalCommits: number
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
  const animatedCommits = useCounterAnimation(stats?.totalCommits || 0, 3000, isVisible)

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
      <div
        className="border transition-all duration-700 ease-out p-6 max-w-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(91, 44, 145, 0.3)' }} />
            <div className="w-24 h-5 rounded animate-pulse" style={{ backgroundColor: 'rgba(91, 44, 145, 0.2)' }} />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: 'rgba(91, 44, 145, 0.2)' }} />
              <div className="w-8 h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(91, 44, 145, 0.2)' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div
        className="border transition-all duration-700 ease-out p-6 max-w-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm font-medium" style={{ color: '#2A2A2A' }}>GitHub Activity</span>
        </div>
        <p className="text-sm" style={{ color: '#6B6B6B' }}>{error || 'Stats unavailable'}</p>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className="border transition-all duration-700 ease-out p-6 max-w-sm hover:shadow-lg"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-lg font-semibold" style={{ color: '#2A2A2A' }}>Live Activity</span>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" style={{ color: '#5B2C91' }} />
            <span className="text-sm" style={{ color: '#6B6B6B' }}>Repositories</span>
          </div>
          <div className="text-xl font-bold transform group-hover:scale-110 transition-transform" style={{ color: '#5B2C91' }}>
            {animatedRepos}
          </div>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: '#8B6DB8' }} />
            <span className="text-sm" style={{ color: '#6B6B6B' }}>Stars</span>
          </div>
          <div className="text-xl font-bold transform group-hover:scale-110 transition-transform" style={{ color: '#8B6DB8' }}>
            {animatedStars}
          </div>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4" style={{ color: '#3D1B5C' }} />
            <span className="text-sm" style={{ color: '#6B6B6B' }}>Forks</span>
          </div>
          <div className="text-xl font-bold transform group-hover:scale-110 transition-transform" style={{ color: '#3D1B5C' }}>
            {animatedForks}
          </div>
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F5F2E8' }} />
            </div>
            <span className="text-sm" style={{ color: '#6B6B6B' }}>Commits</span>
          </div>
          <div className="text-xl font-bold transform group-hover:scale-110 transition-transform" style={{ color: '#3D7C5B' }}>
            {animatedCommits}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(107, 107, 107, 0.2)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#6B6B6B' }}>
          <Calendar className="w-3 h-3" />
          <span>Updated {stats.recentActivity}</span>
        </div>
      </div>
    </div>
  )
}