import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { githubSyncService } from '@/lib/github-sync'
import { getClientIP, sanitizeUserAgent, logAdminActivity } from '@/lib/database'

export async function POST(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const headersList = headers()
    const ip = getClientIP(headersList)
    const userAgent = sanitizeUserAgent(headersList.get('user-agent') || undefined)

    console.log('Starting GitHub sync from admin panel...')

    // Log admin activity
    await logAdminActivity(
      'github_sync_start',
      'projects',
      undefined,
      undefined,
      undefined,
      ip,
      userAgent || undefined
    )

    // Perform the sync
    const result = await githubSyncService.syncAllProjects(
      'admin',
      ip,
      userAgent || undefined
    )

    // Log completion
    await logAdminActivity(
      'github_sync_complete',
      'projects',
      undefined,
      undefined,
      {
        created: result.created,
        updated: result.updated,
        errors: result.errors.length,
        syncedProjects: result.syncedProjects
      },
      ip,
      userAgent || undefined,
      result.success
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Sync completed successfully`,
        data: {
          created: result.created,
          updated: result.updated,
          total: result.created + result.updated,
          syncedProjects: result.syncedProjects
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Sync completed with errors`,
        data: {
          created: result.created,
          updated: result.updated,
          total: result.created + result.updated,
          errors: result.errors,
          syncedProjects: result.syncedProjects
        }
      }, { status: 207 }) // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error('GitHub sync error:', error)
    
    const headersList = headers()
    const ip = getClientIP(headersList)
    const userAgent = sanitizeUserAgent(headersList.get('user-agent') || undefined)

    // Log the error
    await logAdminActivity(
      'github_sync_error',
      'projects',
      undefined,
      undefined,
      { error: error instanceof Error ? error.message : String(error) },
      ip,
      userAgent || undefined,
      false
    )

    return NextResponse.json({
      success: false,
      error: 'GitHub sync failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// Get sync status and history
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { db } = await import('@/lib/database')
    
    // Get recent sync history
    const recentSyncs = await db.gitHubSyncLog.findMany({
      orderBy: { processedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        eventType: true,
        action: true,
        success: true,
        changesCount: true,
        errorMessage: true,
        processedAt: true,
        triggeredBy: true
      }
    })

    // Get project counts
    const projectStats = await db.project.groupBy({
      by: ['status'],
      _count: true
    })

    // Get last successful sync
    const lastSuccessfulSync = await db.gitHubSyncLog.findFirst({
      where: { 
        success: true,
        eventType: 'manual_sync'
      },
      orderBy: { processedAt: 'desc' },
      select: {
        processedAt: true,
        changesCount: true,
        triggeredBy: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        recentSyncs,
        projectStats,
        lastSuccessfulSync
      }
    })

  } catch (error) {
    console.error('Failed to get sync status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get sync status'
    }, { status: 500 })
  }
}