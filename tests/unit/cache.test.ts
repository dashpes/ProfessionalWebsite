import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('SmartCache', () => {
  // Recreate the SmartCache class for testing
  interface CacheEntry<T> {
    data: T
    timestamp: number
    etag?: string
  }

  class SmartCache {
    private cache = new Map<string, CacheEntry<unknown>>()
    private defaultTTL = 5 * 60 * 1000 // 5 minutes

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
        this.cache.clear()
        return
      }

      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    }

    invalidateProjects(): void {
      this.invalidate('repos')
      this.invalidate('projects')
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

  let cache: SmartCache

  beforeEach(() => {
    cache = new SmartCache()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      cache.set('key1', { value: 'test' })
      expect(cache.get('key1')).toEqual({ value: 'test' })
    })

    it('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull()
    })

    it('should store different types of data', () => {
      cache.set('string', 'hello')
      cache.set('number', 42)
      cache.set('array', [1, 2, 3])
      cache.set('object', { a: 1, b: 2 })

      expect(cache.get('string')).toBe('hello')
      expect(cache.get('number')).toBe(42)
      expect(cache.get('array')).toEqual([1, 2, 3])
      expect(cache.get('object')).toEqual({ a: 1, b: 2 })
    })
  })

  describe('TTL expiration', () => {
    it('should return data within TTL', () => {
      cache.set('key', 'value')

      // Advance time by 4 minutes (within 5 minute default TTL)
      vi.advanceTimersByTime(4 * 60 * 1000)

      expect(cache.get('key')).toBe('value')
    })

    it('should expire data after TTL', () => {
      cache.set('key', 'value')

      // Advance time by 6 minutes (past 5 minute default TTL)
      vi.advanceTimersByTime(6 * 60 * 1000)

      expect(cache.get('key')).toBeNull()
    })

    it('should use custom TTL when provided to get', () => {
      cache.set('key', 'value')

      // Advance time by 2 minutes
      vi.advanceTimersByTime(2 * 60 * 1000)

      // With 1 minute TTL, should be expired
      expect(cache.get('key', 1 * 60 * 1000)).toBeNull()

      // Re-set the value
      cache.set('key2', 'value2')

      // With 10 minute TTL, should still be valid
      expect(cache.get('key2', 10 * 60 * 1000)).toBe('value2')
    })
  })

  describe('invalidate', () => {
    it('should clear all cache when no pattern', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      cache.invalidate()

      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
      expect(cache.get('key3')).toBeNull()
    })

    it('should clear matching keys by pattern', () => {
      cache.set('github:repos:user1', 'data1')
      cache.set('github:repos:user2', 'data2')
      cache.set('projects:featured', 'data3')

      cache.invalidate('repos')

      expect(cache.get('github:repos:user1')).toBeNull()
      expect(cache.get('github:repos:user2')).toBeNull()
      expect(cache.get('projects:featured')).toBe('data3')
    })

    it('should handle partial matches', () => {
      cache.set('user:profile:123', 'data1')
      cache.set('user:settings:123', 'data2')
      cache.set('admin:profile:456', 'data3')

      cache.invalidate('profile')

      expect(cache.get('user:profile:123')).toBeNull()
      expect(cache.get('user:settings:123')).toBe('data2')
      expect(cache.get('admin:profile:456')).toBeNull()
    })
  })

  describe('invalidateProjects', () => {
    it('should clear repos and projects cache', () => {
      cache.set('github:repos:user', 'repos')
      cache.set('projects:all', 'all')
      cache.set('projects:featured', 'featured')
      cache.set('other:data', 'other')

      cache.invalidateProjects()

      expect(cache.get('github:repos:user')).toBeNull()
      expect(cache.get('projects:all')).toBeNull()
      expect(cache.get('projects:featured')).toBeNull()
      expect(cache.get('other:data')).toBe('other')
    })
  })

  describe('getStats', () => {
    it('should return empty stats for empty cache', () => {
      const stats = cache.getStats()

      expect(stats.totalEntries).toBe(0)
      expect(stats.freshEntries).toBe(0)
      expect(stats.staleEntries).toBe(0)
      expect(stats.oldestEntry).toBeNull()
      expect(stats.newestEntry).toBeNull()
    })

    it('should count fresh entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const stats = cache.getStats()

      expect(stats.totalEntries).toBe(2)
      expect(stats.freshEntries).toBe(2)
      expect(stats.staleEntries).toBe(0)
    })

    it('should count stale entries', () => {
      cache.set('key1', 'value1')

      // Advance past TTL
      vi.advanceTimersByTime(6 * 60 * 1000)

      cache.set('key2', 'value2') // Fresh entry

      const stats = cache.getStats()

      expect(stats.totalEntries).toBe(2)
      expect(stats.freshEntries).toBe(1)
      expect(stats.staleEntries).toBe(1)
    })

    it('should track oldest and newest entries', () => {
      const now = Date.now()

      cache.set('first', 'value')
      vi.advanceTimersByTime(1000)
      cache.set('second', 'value')
      vi.advanceTimersByTime(1000)
      cache.set('third', 'value')

      const stats = cache.getStats()

      expect(stats.oldestEntry).toBe(now)
      expect(stats.newestEntry).toBe(now + 2000)
    })
  })
})

describe('CACHE_KEYS', () => {
  const CACHE_KEYS = {
    GITHUB_REPOS: (username: string) => `github:repos:${username}`,
    GITHUB_REPO_LANGUAGES: (username: string, repo: string) => `github:languages:${username}/${repo}`,
    PROJECTS_ALL: 'projects:all',
    PROJECTS_FEATURED: 'projects:featured',
    GITHUB_STATS: (username: string) => `github:stats:${username}`
  }

  it('should generate correct GITHUB_REPOS key', () => {
    expect(CACHE_KEYS.GITHUB_REPOS('dashpes')).toBe('github:repos:dashpes')
  })

  it('should generate correct GITHUB_REPO_LANGUAGES key', () => {
    expect(CACHE_KEYS.GITHUB_REPO_LANGUAGES('dashpes', 'my-project')).toBe('github:languages:dashpes/my-project')
  })

  it('should have correct static keys', () => {
    expect(CACHE_KEYS.PROJECTS_ALL).toBe('projects:all')
    expect(CACHE_KEYS.PROJECTS_FEATURED).toBe('projects:featured')
  })

  it('should generate correct GITHUB_STATS key', () => {
    expect(CACHE_KEYS.GITHUB_STATS('dashpes')).toBe('github:stats:dashpes')
  })
})
