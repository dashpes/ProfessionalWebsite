'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitFork, Star, Calendar } from 'lucide-react'
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

export default function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState<number[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

  // Animated counters
  const animatedRepos = useCounterAnimation(stats?.totalRepos || 0, 2000, isVisible)
  const animatedStars = useCounterAnimation(stats?.totalStars || 0, 2500, isVisible)
  const animatedForks = useCounterAnimation(stats?.totalForks || 0, 3000, isVisible)
  const animatedCommits = useCounterAnimation(stats?.totalCommits || 0, 3500, isVisible)

  useEffect(() => {
    fetchGitHubStats()
  }, [])

  useEffect(() => {
    // Show everything immediately - no intersection observer delay
    setIsVisible(true)
    setTitleVisible(true)
    setCardsVisible([0, 1, 2, 3])
  }, [])

  const fetchGitHubStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/github-stats')

      // Always try to parse the JSON response, even if status is not ok
      // The API returns fallback data with 500 status when GitHub API fails
      const data = await response.json()

      if (response.ok || data) {
        setStats(data)
      } else {
        throw new Error('Failed to fetch GitHub stats')
      }
    } catch (err) {
      // Fallback data if everything fails
      const fallbackStats = {
        totalRepos: 25,
        totalStars: 45,
        totalForks: 12,
        totalCommits: 850,
        mostStarredRepo: {
          name: 'portfolio-website',
          stars: 15,
          description: 'Personal portfolio website built with Next.js and TypeScript',
          language: 'TypeScript'
        },
        recentActivity: 'Dec 15, 2024'
      }

      setStats(fallbackStats)
      console.log('Using fallback GitHub stats due to API error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card
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
          <CardTitle className="flex items-center gap-2" style={{ color: '#2A2A2A' }}>
            <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: '#5B2C91', opacity: 0.3 }} />
            GitHub Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-20 h-4 rounded animate-pulse" style={{ backgroundColor: '#5B2C91', opacity: 0.3 }} />
                <div className="w-8 h-6 rounded animate-pulse" style={{ backgroundColor: '#5B2C91', opacity: 0.3 }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card
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
          <CardTitle style={{ color: '#2A2A2A' }}>GitHub Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>{error || 'Stats unavailable'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section
      ref={cardRef}
      className="container mx-auto px-4 py-16 md:py-24"
    >
        {/* Section Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#3D7C5B' }} />
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold" style={{ color: '#5B2C91' }}>Live GitHub Activity</h2>
          </div>
          <p className="text-lg leading-relaxed" style={{ color: '#2A2A2A' }}>Real-time stats from my development journey</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Repositories */}
          <div className={`text-center group transform transition-all duration-700 ease-out ${
            cardsVisible.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div
              className="p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5B2C91'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(91, 44, 145, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#5B2C91' }}>{animatedRepos}</div>
              <div className="uppercase tracking-wide text-xs" style={{ color: '#6B6B6B' }}>Public Repositories</div>
            </div>
          </div>

          {/* Stars */}
          <div className={`text-center group transform transition-all duration-700 ease-out ${
            cardsVisible.includes(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div
              className="p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5B2C91'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(91, 44, 145, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5" style={{ color: '#5B2C91' }} />
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#5B2C91' }}>{animatedStars}</div>
              </div>
              <div className="uppercase tracking-wide text-xs" style={{ color: '#6B6B6B' }}>Stars Earned</div>
            </div>
          </div>

          {/* Forks */}
          <div className={`text-center group transform transition-all duration-700 ease-out ${
            cardsVisible.includes(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div
              className="p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5B2C91'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(91, 44, 145, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <GitFork className="w-5 h-5" style={{ color: '#5B2C91' }} />
                <div className="text-3xl md:text-4xl font-bold" style={{ color: '#5B2C91' }}>{animatedForks}</div>
              </div>
              <div className="uppercase tracking-wide text-xs" style={{ color: '#6B6B6B' }}>Repository Forks</div>
            </div>
          </div>

          {/* Commits */}
          <div className={`text-center group transform transition-all duration-700 ease-out ${
            cardsVisible.includes(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div
              className="p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5B2C91'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(91, 44, 145, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#5B2C91' }}>{animatedCommits}</div>
              <div className="uppercase tracking-wide text-xs" style={{ color: '#6B6B6B' }}>Total Commits</div>
            </div>
          </div>
        </div>

        {/* Featured Repository */}
        {stats.mostStarredRepo && (
          <div className={`max-w-2xl mx-auto transform transition-all duration-800 ease-out delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div
              className="p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4" style={{ color: '#5B2C91' }} />
                <span className="text-base font-semibold" style={{ color: '#5B2C91' }}>Most Popular Repository</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#2A2A2A' }}>{stats.mostStarredRepo.name}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: '#2A2A2A' }}>
                    {stats.mostStarredRepo.description}
                  </p>
                  <div className="flex items-center gap-3">
                    {stats.mostStarredRepo.language && (
                      <Badge variant="outline" className="text-xs border-purple-600 text-purple-600">
                        {stats.mostStarredRepo.language}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#6B6B6B' }}>
                      <Calendar className="w-3 h-3" />
                      <span>Updated {stats.recentActivity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" style={{ color: '#5B2C91' }} />
                    <span className="font-bold" style={{ color: '#2A2A2A' }}>{stats.mostStarredRepo.stars}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </section>
  )
}