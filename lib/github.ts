import { GitHubRepo, Project } from './types'
import { smartCache, CACHE_KEYS } from './cache'

const GITHUB_API_BASE = 'https://api.github.com'

export class GitHubService {
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  private async fetchWithCache<T>(url: string, cacheKey?: string, ttl?: number): Promise<T> {
    const key = cacheKey || url
    
    // Try cache first
    const cached = smartCache.get<T>(key, ttl)
    if (cached) {
      return cached
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'danielashpes-portfolio'
    }

    if (this.token) {
      headers.Authorization = `token ${this.token}`
    }

    try {
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      const etag = response.headers.get('etag')
      
      // Cache with smart cache system
      smartCache.set(key, data, ttl, etag || undefined)
      
      return data
    } catch (error) {
      console.error('GitHub API fetch error:', error)
      throw error
    }
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const cacheKey = CACHE_KEYS.GITHUB_REPOS(username)
    const url = `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching GitHub repos for:', username)
    }
    
    // Use longer cache for repo list (1 hour) since webhooks will invalidate
    const repos = await this.fetchWithCache<GitHubRepo[]>(url, cacheKey, 60 * 60 * 1000)
    
    // Enhance repos with detailed language data
    const enhancedRepos = await this.enhanceWithLanguageData(repos)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Successfully fetched and enhanced', enhancedRepos.length, 'repositories')
    }
    return enhancedRepos
  }

  private async enhanceWithLanguageData(repos: GitHubRepo[]): Promise<GitHubRepo[]> {
    // Process repos in batches to avoid rate limits
    const batchSize = 10
    const enhancedRepos: GitHubRepo[] = []
    
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (repo) => {
        try {
          // Use specific cache key for language data with longer TTL
          const languageCacheKey = CACHE_KEYS.GITHUB_REPO_LANGUAGES('dashpes', repo.name)
          const languages = await this.fetchWithCache<Record<string, number>>(
            repo.languages_url, 
            languageCacheKey,
            60 * 60 * 1000 // 1 hour cache for language data
          )
          return { ...repo, languages }
        } catch (error) {
          console.warn(`Failed to fetch languages for ${repo.name}:`, error)
          return repo
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      enhancedRepos.push(...batchResults)
      
      // Small delay between batches to be respectful to GitHub API
      if (i + batchSize < repos.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return enhancedRepos
  }

  async getRepo(username: string, repoName: string): Promise<GitHubRepo> {
    const url = `${GITHUB_API_BASE}/repos/${username}/${repoName}`
    return this.fetchWithCache<GitHubRepo>(url)
  }

  repoToProject(repo: GitHubRepo): Project {
    return {
      id: repo.name,
      title: this.formatTitle(repo.name),
      description: repo.description || 'No description available',
      technologies: this.extractTechnologies(repo),
      github: repo.html_url,
      live: repo.homepage || undefined,
      featured: repo.stargazers_count > 0 || repo.topics.includes('featured'),
      manual: false,
      status: repo.archived ? 'archived' : 'active'
    }
  }

  private formatTitle(repoName: string): string {
    return repoName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private extractTechnologies(repo: GitHubRepo): string[] {
    const technologies: string[] = []
    
    // Use detailed language data if available
    if (repo.languages) {
      const sortedLanguages = Object.entries(repo.languages)
        .sort(([,a], [,b]) => b - a) // Sort by bytes of code
        .map(([lang]) => lang)
        .filter(lang => this.isSignificantLanguage(lang, repo.languages!))
      
      technologies.push(...sortedLanguages)
    } else if (repo.language) {
      // Fallback to primary language
      technologies.push(repo.language)
    }
    
    // Add GitHub topics as technologies
    repo.topics.forEach(topic => {
      const formattedTopic = this.formatTechnology(topic)
      if (!technologies.includes(formattedTopic)) {
        technologies.push(formattedTopic)
      }
    })

    // Add inferred technologies based on repo patterns
    const inferredTech = this.inferTechnologies(repo)
    inferredTech.forEach(tech => {
      if (!technologies.includes(tech)) {
        technologies.push(tech)
      }
    })

    return technologies.slice(0, 8) // Limit to 8 technologies max
  }

  private isSignificantLanguage(language: string, languages: Record<string, number>): boolean {
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
    const languageBytes = languages[language]
    const percentage = (languageBytes / totalBytes) * 100
    
    // Include languages that make up at least 5% of the codebase
    return percentage >= 5 || ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust'].includes(language)
  }

  private formatTechnology(tech: string): string {
    // Format common technology names
    const techMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'nextjs': 'Next.js',
      'react': 'React',
      'nodejs': 'Node.js',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'svelte': 'Svelte',
      'tailwindcss': 'Tailwind CSS',
      'scss': 'SCSS',
      'css': 'CSS',
      'html': 'HTML',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'aws': 'AWS',
      'gcp': 'Google Cloud',
      'azure': 'Azure'
    }
    
    return techMap[tech.toLowerCase()] || tech.charAt(0).toUpperCase() + tech.slice(1)
  }

  private inferTechnologies(repo: GitHubRepo): string[] {
    const inferred: string[] = []
    const name = repo.name.toLowerCase()
    const description = (repo.description || '').toLowerCase()
    const topics = repo.topics.map(t => t.toLowerCase())
    
    // Infer based on repo name and description
    const patterns = [
      { keywords: ['next', 'nextjs'], tech: 'Next.js' },
      { keywords: ['react'], tech: 'React' },
      { keywords: ['vue'], tech: 'Vue.js' },
      { keywords: ['angular'], tech: 'Angular' },
      { keywords: ['svelte'], tech: 'Svelte' },
      { keywords: ['node', 'express'], tech: 'Node.js' },
      { keywords: ['django', 'flask'], tech: 'Python' },
      { keywords: ['spring', 'springboot'], tech: 'Spring Boot' },
      { keywords: ['docker'], tech: 'Docker' },
      { keywords: ['k8s', 'kubernetes'], tech: 'Kubernetes' },
      { keywords: ['aws', 'lambda'], tech: 'AWS' },
      { keywords: ['firebase'], tech: 'Firebase' },
      { keywords: ['postgres', 'postgresql'], tech: 'PostgreSQL' },
      { keywords: ['mysql'], tech: 'MySQL' },
      { keywords: ['mongo', 'mongodb'], tech: 'MongoDB' },
      { keywords: ['redis'], tech: 'Redis' },
      { keywords: ['tailwind'], tech: 'Tailwind CSS' },
      { keywords: ['scss', 'sass'], tech: 'SCSS' },
      { keywords: ['api', 'rest'], tech: 'REST API' },
      { keywords: ['graphql'], tech: 'GraphQL' },
      { keywords: ['websocket'], tech: 'WebSocket' },
      { keywords: ['pwa'], tech: 'PWA' },
      { keywords: ['mobile', 'ios', 'android'], tech: 'Mobile' },
      { keywords: ['machine-learning', 'ml', 'ai'], tech: 'Machine Learning' },
      { keywords: ['data-analysis', 'analytics'], tech: 'Data Analysis' },
      { keywords: ['blockchain', 'crypto'], tech: 'Blockchain' }
    ]
    
    patterns.forEach(({ keywords, tech }) => {
      if (keywords.some(keyword => 
        name.includes(keyword) || 
        description.includes(keyword) || 
        topics.includes(keyword)
      )) {
        inferred.push(tech)
      }
    })
    
    return inferred
  }
}