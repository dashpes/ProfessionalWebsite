import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { verifyAdminToken } from '@/lib/auth'
import { ProjectConfig } from '@/lib/types'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'projects-config.json')

// Get current project configuration
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const configContent = await readFile(CONFIG_PATH, 'utf-8')
    const config = JSON.parse(configContent) as ProjectConfig
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
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const newConfig: ProjectConfig = await request.json()
    
    // Write the updated configuration to the JSON file
    await writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating project config:', error)
    return NextResponse.json(
      { error: 'Failed to update project configuration' },
      { status: 500 }
    )
  }
}