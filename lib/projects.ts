import { GitHubService } from './github'
import { Project, ProjectConfig } from './types'
import { loadProjectConfig } from './project-actions'

export class ProjectService {
  private github: GitHubService
  
  constructor(githubToken?: string) {
    this.github = new GitHubService(githubToken)
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('ProjectService: Starting to fetch all projects...')
      }
      
      const config = await loadProjectConfig()
      const [githubProjects, manualProjects] = await Promise.all([
        this.getGitHubProjects(config),
        Promise.resolve(config.manualProjects)
      ])

      if (process.env.NODE_ENV === 'development') {
        console.log('ProjectService: Fetched', githubProjects.length, 'GitHub projects and', manualProjects.length, 'manual projects')
      }

      // Combine and sort projects
      const allProjects = [...githubProjects, ...manualProjects]
      
      return allProjects.sort((a, b) => {
        // Sort by order first (if specified), then by featured status, then by title
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        if (a.order !== undefined) return -1
        if (b.order !== undefined) return 1
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return a.title.localeCompare(b.title)
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      const fallbackConfig = await loadProjectConfig()
      return fallbackConfig.manualProjects // Fallback to manual projects only
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    const allProjects = await this.getAllProjects()
    return allProjects.filter(project => project.featured).slice(0, 6)
  }

  private async getGitHubProjects(config: ProjectConfig): Promise<Project[]> {
    try {
      const repos = await this.github.getUserRepos(config.githubUsername)
      
      return repos
        .filter(repo => this.shouldIncludeRepo(repo.name, config))
        .map(repo => {
          const project = this.github.repoToProject(repo)
          
          // Apply any overrides for this repo
          const overrides = config.repoOverrides?.[repo.name]
          if (overrides) {
            Object.assign(project, overrides)
          }
          
          return project
        })
    } catch (error) {
      console.error('Error fetching GitHub projects:', error)
      return []
    }
  }

  private shouldIncludeRepo(repoName: string, config: ProjectConfig): boolean {
    // If includeRepos is specified, only include those
    if (config.includeRepos && config.includeRepos.length > 0) {
      return config.includeRepos.includes(repoName)
    }
    
    // Otherwise, include all except excluded ones
    return !config.excludeRepos?.includes(repoName)
  }
}

// Export a default instance
export const projectService = new ProjectService(process.env.GITHUB_TOKEN)