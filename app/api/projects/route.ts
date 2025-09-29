import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    console.log('Starting projects API call...')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    // Fetch projects from database with technologies
    const projects = await db.project.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        technologies: {
          include: {
            technology: true
          },
          orderBy: {
            percentage: 'desc'
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { featured: 'desc' },
        { starsCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform to match expected format, using overrides when available
    const transformedProjects = projects.map(project => ({
      id: project.name, // Keep using name as ID for compatibility
      title: project.titleOverride || project.title,
      description: project.descriptionOverride || project.description || 'No description available',
      technologies: project.technologies.map(pt => pt.technology.name),
      github: project.githubUrl,
      live: project.liveUrl,
      featured: project.featured,
      manual: project.source === 'MANUAL',
      status: project.status.toLowerCase(),
      image: project.imageUrlOverride || project.imageUrl,
      category: project.category,
      order: project.displayOrder,
      stars: project.starsCount,
      forks: project.forksCount,
      language: project.primaryLanguage,
      size: project.repoSize
    }))
    
    // Shorter cache for better responsiveness to admin changes
    return NextResponse.json(transformedProjects, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' // 1 minute cache
      }
    })
  } catch (error) {
    console.error('Projects API error:', error)
    
    // Return empty array on error
    return NextResponse.json([], { 
      status: 500,
      headers: {
        'Cache-Control': 'public, s-maxage=60' // Cache errors for 1 minute
      }
    })
  }
}