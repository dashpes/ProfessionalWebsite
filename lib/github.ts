import { GitHubRepo, Project } from './types'

const GITHUB_API_BASE = 'https://api.github.com'

export class GitHubService {
  private token?: string
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor(token?: string) {
    this.token = token
  }

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.cache.get(url)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T
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
      this.cache.set(url, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('GitHub API fetch error:', error)
      throw error
    }
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const url = `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching GitHub repos for:', username)
    }
    const repos = await this.fetchWithCache<GitHubRepo[]>(url)
    if (process.env.NODE_ENV === 'development') {
      console.log('Successfully fetched', repos.length, 'repositories')
    }
    return repos
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
    
    if (repo.language) {
      technologies.push(repo.language)
    }
    
    // Add topics as technologies
    repo.topics.forEach(topic => {
      if (!technologies.includes(topic)) {
        technologies.push(topic)
      }
    })

    return technologies
  }
}