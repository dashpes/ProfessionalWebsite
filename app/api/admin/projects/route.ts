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
    // Return a basic configuration to avoid database issues during initial setup
    const config: ProjectConfig = {
      githubUsername: 'danielashpes',
      excludeRepos: [],
      includeRepos: [],
      manualProjects: [],
      repoOverrides: {}
    }

    console.log('Admin projects API: returning basic config (database may not be populated yet)')

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