import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { db, logAdminActivity } from '@/lib/database'

// Update a single project
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const projectId = params.projectId

    // Find the project
    const existingProject = await db.project.findUnique({
      where: { name: projectId },
      include: {
        technologies: true
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update project based on its source type
    if (existingProject.source === 'MANUAL') {
      // Update manual project directly
      await db.project.update({
        where: { name: projectId },
        data: {
          title: data.title,
          description: data.description,
          githubUrl: data.github,
          liveUrl: data.live,
          imageUrl: data.image,
          featured: data.featured,
          displayOrder: data.order,
          updatedAt: new Date()
        }
      })

      // Update technologies
      if (data.technologies) {
        // Remove existing technology associations
        await db.projectTechnology.deleteMany({
          where: { projectId: existingProject.id }
        })

        // Add new technology associations
        for (const [index, techName] of data.technologies.entries()) {
          const technology = await db.technology.upsert({
            where: { name: techName },
            update: {},
            create: {
              name: techName,
              category: 'OTHER',
              color: '#666666'
            }
          })

          await db.projectTechnology.create({
            data: {
              projectId: existingProject.id,
              technologyId: technology.id,
              percentage: Math.max(100 - (index * 10), 10)
            }
          })
        }
      }
    } else {
      // Update GitHub project overrides only
      await db.project.update({
        where: { name: projectId },
        data: {
          titleOverride: data.title !== existingProject.title ? data.title : null,
          descriptionOverride: data.description !== existingProject.description ? data.description : null,
          imageUrlOverride: data.image !== existingProject.imageUrl ? data.image : null,
          featured: data.featured,
          displayOrder: data.order,
          updatedAt: new Date()
        }
      })
    }

    // Log admin activity
    await logAdminActivity(
      'project_update',
      'projects',
      existingProject.id,
      undefined,
      {
        projectName: projectId,
        source: existingProject.source
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projectId = params.projectId

    // Find the project
    const existingProject = await db.project.findUnique({
      where: { name: projectId }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Only allow deleting manual projects
    if (existingProject.source !== 'MANUAL') {
      // For GitHub projects, just clear the overrides
      await db.project.update({
        where: { name: projectId },
        data: {
          titleOverride: null,
          descriptionOverride: null,
          imageUrlOverride: null,
          featured: false,
          displayOrder: null,
          updatedAt: new Date()
        }
      })
    } else {
      // Delete the manual project
      await db.project.delete({
        where: { name: projectId }
      })
    }

    // Log admin activity
    await logAdminActivity(
      existingProject.source === 'MANUAL' ? 'project_delete' : 'project_override_clear',
      'projects',
      existingProject.id,
      undefined,
      {
        projectName: projectId,
        source: existingProject.source
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}