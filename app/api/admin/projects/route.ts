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
      }
    })

    // Separate manual projects from GitHub projects with overrides
    const manualProjects = projects
      .filter(p => p.source === 'MANUAL')
      .map(project => ({
        id: project.name,
        title: project.title,
        description: project.description || '',
        technologies: project.technologies.map(pt => pt.technology.name),
        github: project.githubUrl,
        live: project.liveUrl,
        image: project.imageUrl,
        featured: project.featured,
        manual: true,
        order: project.displayOrder
      }))

    const repoOverrides: Record<string, {
      title?: string
      description?: string
      image?: string
      featured?: boolean
      order?: number
      technologies?: string[]
    }> = {}
    projects
      .filter(p => p.source === 'GITHUB')
      .forEach(project => {
        // Include all GitHub projects, showing current values (with overrides if they exist)
        repoOverrides[project.name] = {
          title: project.titleOverride || project.title,
          description: project.descriptionOverride || project.description,
          image: project.imageUrlOverride || project.imageUrl,
          featured: project.featured,
          order: project.displayOrder,
          technologies: project.technologies.map(pt => pt.technology.name)
        }
      })

    // Get settings from database (we'll use first project's metadata or defaults)
    const firstProject = projects[0]
    const config: ProjectConfig = {
      githubUsername: firstProject?.name.split('/')[0] || 'danielashpes',
      excludeRepos: [], // TODO: Store in separate settings table
      includeRepos: [],
      manualProjects,
      repoOverrides
    }

    console.log('Admin projects API:', {
      totalProjects: projects.length,
      manualProjects: manualProjects.length,
      repoOverrides: Object.keys(repoOverrides).length,
      allProjects: projects.map(p => ({ name: p.name, source: p.source, title: p.title })),
      githubProjects: projects.filter(p => p.source === 'GITHUB').map(p => ({ 
        name: p.name, 
        title: p.title,
        titleOverride: p.titleOverride,
        featured: p.featured 
      })),
      repoOverridesKeys: Object.keys(repoOverrides)
    })

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
        // First, remove existing technology associations
        await db.projectTechnology.deleteMany({
          where: { projectName: manualProject.id }
        })

        // Add new technology associations
        for (const [index, techName] of manualProject.technologies.entries()) {
          // Ensure technology exists
          await db.technology.upsert({
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
              projectName: manualProject.id,
              technologyName: techName,
              percentage: Math.max(100 - (index * 10), 10) // Decreasing percentage
            }
          })
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
      authResult.userId,
      'PROJECT_UPDATE',
      'Updated project configuration',
      request
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