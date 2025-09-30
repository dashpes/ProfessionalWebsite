import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // Create projects directory if it doesn't exist
    const projectsDir = path.join(process.cwd(), 'public', 'projects')
    try {
      await mkdir(projectsDir, { recursive: true })
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`
    const filePath = path.join(projectsDir, fileName)

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/projects/${fileName}`
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: fileName 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}