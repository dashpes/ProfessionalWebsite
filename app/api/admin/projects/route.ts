import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { db, logAdminActivity } from '@/lib/database'
import { ProjectConfig } from '@/lib/types'

// Get current project configuration
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all projects from database
    const projects = await db.project.findMany({
      include: {
        technologies: {
          include: {
            technology: true
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Separate manual and GitHub projects
    const manualProjects = projects
      .filter(p => p.source === 'MANUAL')
      .map(p => ({
        id: p.name,
        title: p.title,
        description: p.description || '',
        technologies: p.technologies.map(t => t.technology.name),
        featured: p.featured,
        github: p.githubUrl,
        live: p.liveUrl,
        image: p.imageUrl,
        order: p.displayOrder,
        manual: true
      }))

    // Get all GitHub projects
    const githubProjects = projects
      .filter(p => p.source === 'GITHUB')
      .map(p => ({
        id: p.name,
        title: p.titleOverride || p.title,
        description: p.descriptionOverride || p.description || '',
        technologies: p.technologies.map(t => t.technology.name),
        featured: p.featured,
        github: p.githubUrl,
        live: p.liveUrl,
        image: p.imageUrlOverride || p.imageUrl,
        order: p.displayOrder,
        manual: false,
        hasOverrides: !!(p.titleOverride || p.descriptionOverride || p.imageUrlOverride || p.featured || p.displayOrder)
      }))

    // Build repo overrides from GitHub projects with overrides
    const repoOverrides: Record<string, {
      title: string
      description: string | null
      image: string | null
      featured: boolean
      order: number | null
      technologies: string[]
    }> = {}
    projects
      .filter(p => p.source === 'GITHUB')
      .filter(p => p.titleOverride || p.descriptionOverride || p.imageUrlOverride || p.featured || p.displayOrder)
      .forEach(p => {
        repoOverrides[p.name] = {
          title: p.titleOverride || p.title,
          description: p.descriptionOverride || p.description,
          image: p.imageUrlOverride || p.imageUrl,
          featured: p.featured,
          order: p.displayOrder,
          technologies: p.technologies.map(t => t.technology.name)
        }
      })

    const config: ProjectConfig & { githubProjects?: Array<{
      id: string
      title: string
      description: string
      technologies: string[]
      featured: boolean
      github: string | null
      live: string | null
      image: string | null
      order: number | null
      manual: boolean
      hasOverrides?: boolean
    }> } = {
      githubUsername: 'danielashpes',
      excludeRepos: [],
      includeRepos: [],
      manualProjects,
      repoOverrides,
      githubProjects
    }

    console.log('Admin projects API: fetched', manualProjects.length, 'manual projects,', githubProjects.length, 'GitHub projects, and', Object.keys(repoOverrides).length, 'repo overrides')

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading project config:', error)
    return NextResponse.json(
      { error: 'Failed to read project configuration' },
      { status: 500 }
    )
  }
}

// Update project configuration
export async function PUT(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const newConfig: ProjectConfig = await request.json()
    
    // Handle manual projects
    for (const manualProject of newConfig.manualProjects) {
      await db.project.upsert({
        where: { name: manualProject.id },
        update: {
          title: manualProject.title,
          description: manualProject.description,
          githubUrl: manualProject.github,
          liveUrl: manualProject.live,
          imageUrl: manualProject.image,
          featured: manualProject.featured,
          displayOrder: manualProject.order,
          status: 'ACTIVE',
          updatedAt: new Date()
        },
        create: {
          name: manualProject.id,
          title: manualProject.title,
          description: manualProject.description,
          githubUrl: manualProject.github,
          liveUrl: manualProject.live,
          imageUrl: manualProject.image,
          featured: manualProject.featured,
          displayOrder: manualProject.order,
          source: 'MANUAL',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Handle technologies for manual projects
      if (manualProject.technologies?.length) {
        // Get the project we just created/updated
        const project = await db.project.findUnique({
          where: { name: manualProject.id }
        })
        
        if (project) {
          // First, remove existing technology associations
          await db.projectTechnology.deleteMany({
            where: { projectId: project.id }
          })

          // Add new technology associations
          for (const [index, techName] of manualProject.technologies.entries()) {
            // Ensure technology exists
            const technology = await db.technology.upsert({
              where: { name: techName },
              update: {},
              create: {
                name: techName,
                category: 'OTHER', // Default category
                color: '#666666' // Default color
              }
            })

            // Create project-technology association
            await db.projectTechnology.create({
              data: {
                projectId: project.id,
                technologyId: technology.id,
                percentage: Math.max(100 - (index * 10), 10) // Decreasing percentage
              }
            })
          }
        }
      }
    }

    // Handle repository overrides
    for (const [repoName, override] of Object.entries(newConfig.repoOverrides || {})) {
      await db.project.updateMany({
        where: { 
          name: repoName,
          source: 'GITHUB'
        },
        data: {
          titleOverride: override.title,
          descriptionOverride: override.description,
          imageUrlOverride: override.image,
          featured: override.featured,
          displayOrder: override.order,
          updatedAt: new Date()
        }
      })
    }

    // Log admin activity
    await logAdminActivity(
      'project_config_update',
      'projects',
      undefined,
      undefined,
      { message: 'Updated project configuration' }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating project config:', error)
    return NextResponse.json(
      { error: 'Failed to update project configuration' },
      { status: 500 }
    )
  }
}