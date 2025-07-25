import { db, logGitHubSync } from './database'
import { GitHubService } from './github'
import { loadProjectConfig } from './project-actions'
import { ProjectStatus, TechnologyCategory } from '@prisma/client'

interface SyncResult {
  success: boolean
  created: number
  updated: number
  errors: string[]
  syncedProjects: string[]
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description?: string
  html_url: string
  homepage?: string
  stargazers_count: number
  forks_count: number
  language?: string
  size: number
  private: boolean
  created_at: string
  updated_at: string
}

interface ProjectOverrides {
  title?: string
  description?: string
  image?: string
  featured?: boolean
  order?: number
}

interface ProjectData {
  name: string
  title: string
  description?: string
  githubUrl: string
  liveUrl?: string
  imageUrl?: string
  category?: string
  featured: boolean
  displayOrder?: number
  starsCount: number
  forksCount: number
  primaryLanguage?: string
  repoSize: number
  isPrivate: boolean
  source: 'GITHUB' | 'MANUAL'
  status: ProjectStatus
}

export class GitHubSyncService {
  private githubService: GitHubService
  
  constructor(githubToken?: string) {
    this.githubService = new GitHubService(githubToken)
  }

  /**
   * Sync all projects from GitHub API to database
   * Uses existing project-config.json for overrides and exclusions
   */
  async syncAllProjects(
    triggeredBy: string = 'system',
    ipAddress?: string,
    userAgent?: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      errors: [],
      syncedProjects: []
    }

    try {
      console.log('Starting GitHub sync...')
      
      // Load existing configuration for overrides and exclusions
      const config = await loadProjectConfig()
      
      // Fetch repos from GitHub
      const githubRepos = await this.githubService.getUserRepos(config.githubUsername)
      console.log(`Fetched ${githubRepos.length} repositories from GitHub`)

      // Filter repos based on config
      const filteredRepos = githubRepos.filter(repo => 
        this.shouldIncludeRepo(repo.name, config.excludeRepos || [], config.includeRepos || [])
      )
      
      console.log(`Processing ${filteredRepos.length} repositories after filtering`)

      // Process each repository
      for (const repo of filteredRepos) {
        try {
          const projectData = await this.convertRepoToProject(repo, config.repoOverrides?.[repo.name])
          
          // Check if project exists (with retry for connection issues)
          let existingProject
          try {
            existingProject = await db.project.findUnique({
              where: { githubId: repo.id }
            })
          } catch (dbError) {
            // Retry once for connection issues
            if (dbError instanceof Error && dbError.message.includes('prepared statement')) {
              console.log(`Retrying database query for ${repo.name}...`)
              await new Promise(resolve => setTimeout(resolve, 1000))
              existingProject = await db.project.findUnique({
                where: { githubId: repo.id }
              })
            } else {
              throw dbError
            }
          }

          if (existingProject) {
            // Update existing project
            await this.updateProject(existingProject.id, projectData, repo)
            result.updated++
            console.log(`Updated project: ${repo.name}`)
          } else {
            // Create new project
            await this.createProject(projectData, repo)
            result.created++
            console.log(`Created project: ${repo.name}`)
          }

          result.syncedProjects.push(repo.name)
          
        } catch (error) {
          const errorMsg = `Failed to sync ${repo.name}: ${error instanceof Error ? error.message : String(error)}`
          result.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      result.success = result.errors.length === 0

      // Log the sync operation
      await logGitHubSync(
        'manual_sync',
        'sync_all',
        undefined,
        undefined,
        result.success,
        result.errors.length > 0 ? result.errors.join('; ') : undefined,
        result.created + result.updated,
        triggeredBy,
        ipAddress,
        userAgent
      )

      console.log(`GitHub sync completed: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`)
      
    } catch (error) {
      const errorMsg = `GitHub sync failed: ${error instanceof Error ? error.message : String(error)}`
      result.errors.push(errorMsg)
      console.error(errorMsg)

      await logGitHubSync(
        'manual_sync',
        'sync_all',
        undefined,
        undefined,
        false,
        errorMsg,
        0,
        triggeredBy,
        ipAddress,
        userAgent
      )
    }

    return result
  }

  /**
   * Convert GitHub repo to database project format
   */
  private async convertRepoToProject(repo: GitHubRepo, overrides?: ProjectOverrides) {
    // Extract technologies from GitHub data
    const technologies = this.githubService.extractTechnologies ? 
      await this.githubService.extractTechnologies(repo) : 
      this.extractBasicTechnologies(repo)

    // Determine status
    const status = repo.archived ? ProjectStatus.ARCHIVED : ProjectStatus.ACTIVE

    // Build project data
    const projectData = {
      githubId: repo.id,
      name: repo.name,
      title: overrides?.title || this.formatTitle(repo.name),
      description: overrides?.description || repo.description || 'No description available',
      githubUrl: repo.html_url,
      liveUrl: overrides?.live || repo.homepage || null,
      imageUrl: overrides?.image || null,
      category: overrides?.category || this.inferCategory(repo),
      status,
      featured: overrides?.featured || false,
      displayOrder: overrides?.order || null,
      starsCount: repo.stargazers_count || 0,
      forksCount: repo.forks_count || 0,
      primaryLanguage: repo.language,
      repoSize: repo.size || 0,
      isPrivate: repo.private || false,
      lastGithubSync: new Date(),
    }

    return { projectData, technologies }
  }

  /**
   * Create new project with technologies
   */
  private async createProject(data: ProjectData, repo: GitHubRepo) {
    const { projectData, technologies } = data

    // Create project
    const project = await db.project.create({
      data: projectData
    })

    // Add technologies
    await this.syncProjectTechnologies(project.id, technologies, repo.languages)
    
    return project
  }

  /**
   * Update existing project with technologies
   */
  private async updateProject(projectId: string, data: ProjectData, repo: GitHubRepo) {
    const { projectData, technologies } = data

    // Update project
    const project = await db.project.update({
      where: { id: projectId },
      data: projectData
    })

    // Sync technologies (remove old ones, add new ones)
    await this.syncProjectTechnologies(projectId, technologies, repo.languages)
    
    return project
  }

  /**
   * Sync project technologies
   */
  private async syncProjectTechnologies(
    projectId: string, 
    technologies: string[], 
    languageData?: Record<string, number>
  ) {
    // Remove existing technologies
    await db.projectTechnology.deleteMany({
      where: { projectId }
    })

    // Add new technologies
    for (const techName of technologies) {
      // Find or create technology
      let technology = await db.technology.findUnique({
        where: { name: techName }
      })

      if (!technology) {
        technology = await db.technology.create({
          data: {
            name: techName,
            category: this.getTechnologyCategory(techName),
            color: this.getTechnologyColor(techName),
          }
        })
      }

      // Calculate percentage if we have language data
      let percentage = null
      let bytesCount = null
      
      if (languageData && languageData[techName]) {
        const totalBytes = Object.values(languageData).reduce((sum, bytes) => sum + bytes, 0)
        percentage = (languageData[techName] / totalBytes) * 100
        bytesCount = languageData[techName]
      }

      // Create relationship
      await db.projectTechnology.create({
        data: {
          projectId,
          technologyId: technology.id,
          percentage: percentage,
          bytesCount: bytesCount ? BigInt(bytesCount) : null,
        }
      })
    }
  }

  /**
   * Basic technology extraction (fallback)
   */
  private extractBasicTechnologies(repo: GitHubRepo): string[] {
    const technologies: string[] = []
    
    if (repo.language) {
      technologies.push(repo.language)
    }
    
    if (repo.topics) {
      technologies.push(...repo.topics)
    }
    
    return technologies
  }

  /**
   * Determine if repo should be included
   */
  private shouldIncludeRepo(
    repoName: string, 
    excludeRepos: string[], 
    includeRepos: string[]
  ): boolean {
    if (includeRepos.length > 0) {
      return includeRepos.includes(repoName)
    }
    
    return !excludeRepos.includes(repoName)
  }

  /**
   * Format repository name to title
   */
  private formatTitle(repoName: string): string {
    return repoName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Infer project category from repo data
   */
  private inferCategory(repo: GitHubRepo): string | null {
    const name = repo.name.toLowerCase()
    const description = (repo.description || '').toLowerCase()
    const topics = repo.topics?.join(' ').toLowerCase() || ''
    
    const content = `${name} ${description} ${topics}`
    
    if (content.includes('portfolio') || content.includes('website')) return 'Portfolio'
    if (content.includes('api') || content.includes('backend')) return 'Backend'
    if (content.includes('frontend') || content.includes('react') || content.includes('vue')) return 'Frontend'
    if (content.includes('mobile') || content.includes('app')) return 'Mobile'
    if (content.includes('data') || content.includes('analysis')) return 'Data Science'
    if (content.includes('game')) return 'Game'
    if (content.includes('tool') || content.includes('utility')) return 'Tool'
    
    return null
  }

  /**
   * Get technology category
   */
  private getTechnologyCategory(techName: string): TechnologyCategory {
    const name = techName.toLowerCase()
    
    // Languages
    if (['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'c', 'php', 'ruby'].includes(name)) {
      return TechnologyCategory.LANGUAGE
    }
    
    // Frameworks
    if (['react', 'vue', 'angular', 'next.js', 'nuxt', 'svelte', 'express', 'fastapi', 'django', 'flask'].includes(name)) {
      return TechnologyCategory.FRAMEWORK
    }
    
    // Databases
    if (['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite'].includes(name)) {
      return TechnologyCategory.DATABASE
    }
    
    // Cloud platforms
    if (['aws', 'gcp', 'azure', 'vercel', 'netlify'].includes(name)) {
      return TechnologyCategory.CLOUD
    }
    
    // Tools
    if (['docker', 'kubernetes', 'git', 'webpack', 'vite'].includes(name)) {
      return TechnologyCategory.TOOL
    }
    
    return TechnologyCategory.OTHER
  }

  /**
   * Get technology brand color
   */
  private getTechnologyColor(techName: string): string | null {
    const colors: Record<string, string> = {
      'javascript': '#F7DF1E',
      'typescript': '#3178C6',
      'python': '#3776AB',
      'react': '#61DAFB',
      'vue.js': '#4FC08D',
      'next.js': '#000000',
      'node.js': '#339933',
      'postgresql': '#336791',
      'mysql': '#4479A1',
      'mongodb': '#47A248',
      'docker': '#2496ED',
      'aws': '#FF9900',
      'vercel': '#000000',
    }
    
    return colors[techName.toLowerCase()] || null
  }
}

// Export lazy-initialized singleton instance
let _githubSyncService: GitHubSyncService | null = null

export const githubSyncService = {
  get instance(): GitHubSyncService {
    if (!_githubSyncService) {
      _githubSyncService = new GitHubSyncService(process.env.GITHUB_TOKEN)
    }
    return _githubSyncService
  },
  
  // Proxy methods to maintain backward compatibility
  async syncAllProjects(triggeredBy: string, ip: string, userAgent?: string) {
    return this.instance.syncAllProjects(triggeredBy, ip, userAgent)
  }
}