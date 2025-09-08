import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Standard Prisma client setup
export const db = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// ================================
// SECURITY UTILITIES
// ================================

/**
 * Hash IP address for privacy-compliant analytics
 * Uses SHA-256 with salt for anonymization
 */
export function hashIP(ipAddress: string): string {
  const salt = process.env.IP_HASH_SALT || 'portfolio-analytics-salt'
  return createHash('sha256')
    .update(ipAddress + salt)
    .digest('hex')
    .substring(0, 32) // Truncate for storage efficiency
}

/**
 * Extract country code from IP (placeholder for future geo-IP service)
 * For now returns null, can be enhanced with a geo-IP service
 */
export function getCountryFromIP(): string | null {
  // TODO: Integrate with geo-IP service like MaxMind or IP-API
  // For now, return null to maintain privacy
  return null
}

/**
 * Clean and validate user agent string
 */
export function sanitizeUserAgent(userAgent: string | undefined): string | null {
  if (!userAgent) return null
  
  // Truncate to prevent potential issues and limit storage
  const cleaned = userAgent.substring(0, 500).trim()
  
  // Remove potentially dangerous characters
  return cleaned.replace(/[<>'"]/g, '')
}

/**
 * Get client IP address from request headers (for analytics)
 * Handles various proxy configurations
 */
export function getClientIP(headers: Headers): string {
  // Try various headers that might contain the real IP
  const candidates = [
    headers.get('x-forwarded-for'),
    headers.get('x-real-ip'),
    headers.get('cf-connecting-ip'), // Cloudflare
    headers.get('x-client-ip'),
    headers.get('true-client-ip'),
  ]
  
  for (const candidate of candidates) {
    if (candidate) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = candidate.split(',')[0].trim()
      if (ip && ip !== 'unknown') {
        return ip
      }
    }
  }
  
  // Fallback - this should not happen in production
  return '127.0.0.1'
}

// ================================
// ANALYTICS HELPERS
// ================================

/**
 * Track project view with privacy protection
 */
export async function trackProjectView(
  projectId: string,
  headers: Headers
): Promise<void> {
  try {
    const ip = getClientIP(headers)
    const ipHash = hashIP(ip)
    const userAgent = sanitizeUserAgent(headers.get('user-agent') || undefined)
    const referrer = headers.get('referer')?.substring(0, 500) || null
    const country = getCountryFromIP()
    
    await db.projectView.create({
      data: {
        projectId,
        ipHash,
        userAgent,
        referrer,
        country,
      },
    })
  } catch (error) {
    // Fail silently for analytics - don't break the main request
    console.error('Failed to track project view:', error)
  }
}

/**
 * Track blog post view with reading metrics
 */
export async function trackBlogPostView(
  postId: string,
  headers: Headers,
  readingProgress?: number,
  timeSpentSeconds?: number
): Promise<void> {
  try {
    const ip = getClientIP(headers)
    const ipHash = hashIP(ip)
    const userAgent = sanitizeUserAgent(headers.get('user-agent') || undefined)
    const referrer = headers.get('referer')?.substring(0, 500) || null
    const country = getCountryFromIP()
    
    await db.blogPostView.create({
      data: {
        postId,
        ipHash,
        userAgent,
        referrer,
        country,
        readingProgress: readingProgress ? readingProgress : null,
        timeSpentSeconds: timeSpentSeconds || null,
      },
    })
    
    // Increment view count on the post
    await db.blogPost.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Failed to track blog post view:', error)
  }
}

/**
 * Log admin activity for security audit
 */
export async function logAdminActivity(
  action: string,
  resource?: string,
  resourceId?: string,
  oldData?: unknown,
  newData?: unknown,
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true
): Promise<void> {
  try {
    await db.adminActivity.create({
      data: {
        action,
        resource: resource || null,
        resourceId: resourceId || null,
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: sanitizeUserAgent(userAgent) || 'Unknown',
        success,
      },
    })
  } catch (error) {
    console.error('Failed to log admin activity:', error)
  }
}

/**
 * Log GitHub sync operation
 */
export async function logGitHubSync(
  eventType: string,
  action: string,
  repositoryName?: string,
  projectId?: string,
  success: boolean = true,
  errorMessage?: string,
  changesCount: number = 0,
  triggeredBy?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.gitHubSyncLog.create({
      data: {
        eventType,
        action,
        repositoryName: repositoryName || null,
        projectId: projectId || null,
        success,
        errorMessage: errorMessage || null,
        changesCount,
        triggeredBy: triggeredBy || 'system',
        ipAddress: ipAddress || null,
        userAgent: sanitizeUserAgent(userAgent) || null,
      },
    })
  } catch (error) {
    console.error('Failed to log GitHub sync:', error)
  }
}

// ================================
// CONNECTION HEALTH CHECK
// ================================

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}