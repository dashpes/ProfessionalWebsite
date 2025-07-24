export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  archived: boolean
  private: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  image?: string
  technologies: string[]
  github?: string
  live?: string
  featured?: boolean
  manual?: boolean
  order?: number
  category?: string
  status?: 'active' | 'archived' | 'in-development'
}

export interface ProjectConfig {
  githubUsername: string
  excludeRepos?: string[]
  includeRepos?: string[]
  manualProjects: Project[]
  repoOverrides?: Record<string, Partial<Project>>
}