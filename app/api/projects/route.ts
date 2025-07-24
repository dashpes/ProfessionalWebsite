import { NextResponse } from 'next/server'
import { projectService } from '@/lib/projects'

export async function GET() {
  try {
    const projects = await projectService.getAllProjects()
    
    // Cache for 5 minutes to avoid excessive GitHub API calls
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150'
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