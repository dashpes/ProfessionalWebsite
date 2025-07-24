interface CacheEntry<T> {
  data: T
  timestamp: number
  etag?: string
}

class SmartCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private longTTL = 60 * 60 * 1000 // 1 hour
  
  set<T>(key: string, data: T, ttl?: number, etag?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    })
  }
  
  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    
    if (!entry) {
      return null
    }
    
    const maxAge = ttl || this.defaultTTL
    const isExpired = Date.now() - entry.timestamp > maxAge
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) {
      // Clear all cache
      this.cache.clear()
      return
    }
    
    // Clear cache entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
  
  invalidateProjects(): void {
    this.invalidate('repos')
    this.invalidate('projects')
    console.log('Project cache invalidated')
  }
  
  getStats() {
    const entries = Array.from(this.cache.entries())
    const now = Date.now()
    
    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(([, entry]) => 
        now - entry.timestamp < this.defaultTTL
      ).length,
      staleEntries: entries.filter(([, entry]) => 
        now - entry.timestamp >= this.defaultTTL
      ).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(([, entry]) => entry.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(([, entry]) => entry.timestamp)) : null
    }
  }
}

// Export singleton instance
export const smartCache = new SmartCache()

// Cache keys for different data types
export const CACHE_KEYS = {
  GITHUB_REPOS: (username: string) => `github:repos:${username}`,
  GITHUB_REPO_LANGUAGES: (username: string, repo: string) => `github:languages:${username}/${repo}`,
  PROJECTS_ALL: 'projects:all',
  PROJECTS_FEATURED: 'projects:featured',
  GITHUB_STATS: (username: string) => `github:stats:${username}`
} as const