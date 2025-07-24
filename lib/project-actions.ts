'use server'

import { readFile } from 'fs/promises'
import path from 'path'
import { ProjectConfig } from './types'

export async function loadProjectConfig(): Promise<ProjectConfig> {
  try {
    const configPath = path.join(process.cwd(), 'data', 'projects-config.json')
    const configContent = await readFile(configPath, 'utf-8')
    return JSON.parse(configContent) as ProjectConfig
  } catch (error) {
    console.error('Error loading project config, using fallback:', error)
    // Fallback configuration
    return {
      githubUsername: 'dashpes',
      excludeRepos: ['danielashpes', '.github', 'private-notes'],
      includeRepos: [],
      manualProjects: [],
      repoOverrides: {}
    }
  }
}