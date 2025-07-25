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

    // Transform to match expected format
    const transformedProjects = projects.map(project => ({
      id: project.name, // Keep using name as ID for compatibility
      title: project.title,
      description: project.description || 'No description available',
      technologies: project.technologies.map(pt => pt.technology.name),
      github: project.githubUrl,
      live: project.liveUrl,
      featured: project.featured,
      manual: false, // All database projects are from GitHub
      status: project.status.toLowerCase(),
      image: project.imageUrl,
      category: project.category,
      order: project.displayOrder,
      stars: project.starsCount,
      forks: project.forksCount,
      language: project.primaryLanguage,
      size: project.repoSize
    }))
    
    // Cache for longer since database is fast and we have real-time sync
    return NextResponse.json(transformedProjects, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' // 1 hour cache
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