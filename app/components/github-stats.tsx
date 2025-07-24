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
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState<number[]>([])
  const cardRef = useRef<HTMLDivElement>(null)

  // Animated counters
  const animatedRepos = useCounterAnimation(stats?.totalRepos || 0, 2000, isVisible)
  const animatedStars = useCounterAnimation(stats?.totalStars || 0, 2500, isVisible)
  const animatedForks = useCounterAnimation(stats?.totalForks || 0, 3000, isVisible)

  useEffect(() => {
    fetchGitHubStats()
  }, [])

  useEffect(() => {
    // Show everything immediately - no intersection observer delay
    setIsVisible(true)
    setTitleVisible(true)
    setCardsVisible([0, 1, 2])
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
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
            GitHub Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse" />
                <div className="w-8 h-6 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>GitHub Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">{error || 'Stats unavailable'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section 
      ref={cardRef}
      className="py-12 md:py-16 bg-gradient-to-b from-black via-gray-950 to-black border-y border-gray-800"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-10 transform transition-all duration-800 ease-out ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold">Live GitHub Activity</h2>
          </div>
          <p className="text-gray-400">Real-time stats from my development journey</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Repositories */}
          <div className={`text-center group transform transition-all duration-600 ease-out ${
            cardsVisible.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 transform hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{animatedRepos}</div>
              <div className="text-gray-400 uppercase tracking-wide text-xs">Public Repositories</div>
            </div>
          </div>

          {/* Stars */}
          <div className={`text-center group transform transition-all duration-600 ease-out ${
            cardsVisible.includes(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:scale-105">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">{animatedStars}</div>
              </div>
              <div className="text-gray-400 uppercase tracking-wide text-xs">Stars Earned</div>
            </div>
          </div>

          {/* Forks */}
          <div className={`text-center group transform transition-all duration-600 ease-out ${
            cardsVisible.includes(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-105">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GitFork className="w-5 h-5 text-blue-400" />
                <div className="text-3xl md:text-4xl font-bold text-blue-400">{animatedForks}</div>
              </div>
              <div className="text-gray-400 uppercase tracking-wide text-xs">Repository Forks</div>
            </div>
          </div>
        </div>

        {/* Featured Repository */}
        {stats.mostStarredRepo && (
          <div className={`max-w-2xl mx-auto transform transition-all duration-800 ease-out delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-base font-semibold text-purple-300">Most Popular Repository</span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{stats.mostStarredRepo.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {stats.mostStarredRepo.description}
                  </p>
                  <div className="flex items-center gap-3">
                    {stats.mostStarredRepo.language && (
                      <Badge variant="outline" className="text-xs border-purple-500 text-purple-300">
                        {stats.mostStarredRepo.language}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {stats.recentActivity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold">{stats.mostStarredRepo.stars}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}