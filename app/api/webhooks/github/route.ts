import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

interface GitHubWebhookPayload {
  action: string
  repository: {
    name: string
    full_name: string
    private: boolean
  }
  sender: {
    login: string
  }
}

function verifyGitHubSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('GITHUB_WEBHOOK_SECRET not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex')

  const expectedSignatureWithPrefix = `sha256=${expectedSignature}`
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignatureWithPrefix)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('x-hub-signature-256')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify webhook signature
    if (!verifyGitHubSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload: GitHubWebhookPayload = JSON.parse(body)
    
    // Only process public repositories from the expected user
    if (payload.repository.private || payload.sender.login !== 'dashpes') {
      return NextResponse.json({ message: 'Ignored' })
    }

    // Log the webhook event
    console.log(`GitHub webhook: ${payload.action} on ${payload.repository.full_name}`)

    // Here we would trigger cache invalidation or database updates
    // For now, we'll just clear the cache for the projects service
    await handleRepositoryUpdate(payload)

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      repository: payload.repository.name,
      action: payload.action
    })

  } catch (error) {
    console.error('GitHub webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleRepositoryUpdate(payload: GitHubWebhookPayload) {
  const { smartCache } = await import('@/lib/cache')
  
  const actions = ['created', 'deleted', 'publicized', 'privatized', 'edited', 'pushed']
  
  if (actions.includes(payload.action)) {
    console.log(`Repository ${payload.repository.name} ${payload.action} - invalidating cache`)
    
    // Invalidate project-related cache
    smartCache.invalidateProjects()
    
    // Also invalidate specific repo language cache if it was edited/pushed
    if (['edited', 'pushed'].includes(payload.action)) {
      smartCache.invalidate(`github:languages:dashpes/${payload.repository.name}`)
    }
    
    console.log('Cache invalidated - fresh data will be fetched on next request')
    
    // Future: Update database here
    // await updateProjectInDatabase(payload.repository)
    
    // Future: Send real-time updates to connected clients
    // await notifyClients(payload)
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'GitHub webhook endpoint active',
    configured: !!WEBHOOK_SECRET
  })
}