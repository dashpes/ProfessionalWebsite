import { NextResponse } from 'next/server'
import { projectService } from '@/lib/projects'

export async function GET() {
  try {
    const featuredProjects = await projectService.getFeaturedProjects()
    
    // Cache for 5 minutes to avoid excessive GitHub API calls
    return NextResponse.json(featuredProjects, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150'
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