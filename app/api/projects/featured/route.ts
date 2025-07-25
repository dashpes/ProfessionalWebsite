import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Fetch featured projects from database
    const featuredProjects = await db.project.findMany({
      where: {
        status: 'ACTIVE',
        featured: true
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
        { starsCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 6 // Limit to 6 featured projects
    })

    // Transform to match expected format
    const transformedProjects = featuredProjects.map(project => ({
      id: project.name,
      title: project.title,
      description: project.description || 'No description available',
      technologies: project.technologies.map(pt => pt.technology.name),
      github: project.githubUrl,
      live: project.liveUrl,
      featured: project.featured,
      manual: false,
      status: project.status.toLowerCase(),
      image: project.imageUrl,
      category: project.category,
      order: project.displayOrder,
      stars: project.starsCount,
      forks: project.forksCount,
      language: project.primaryLanguage
    }))
    
    // Cache for longer since database is fast
    return NextResponse.json(transformedProjects, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' // 1 hour cache
      }
    })
  } catch (error) {
    console.error('Featured projects API error:', error)
    
    // Return empty array on error
    return NextResponse.json([], { 
      status: 500,
      headers: {
        'Cache-Control': 'public, s-maxage=60' // Cache errors for 1 minute
      }
    })
  }
}