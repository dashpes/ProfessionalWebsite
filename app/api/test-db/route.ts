import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== Database Test Starting ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    // Test 1: Can we import Prisma?
    console.log('Testing Prisma import...')
    const { PrismaClient } = await import('@prisma/client')
    console.log('✓ Prisma imported successfully')
    
    // Test 2: Can we create client?
    console.log('Testing Prisma client creation...')
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    })
    console.log('✓ Prisma client created')
    
    // Test 3: Can we connect?
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✓ Database connected')
    
    // Test 4: Can we query?
    console.log('Testing simple query...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✓ Query successful:', result)
    
    // Test 5: Can we query projects table?
    console.log('Testing projects table...')
    const projectCount = await prisma.project.count()
    console.log('✓ Projects count:', projectCount)
    
    // Cleanup
    await prisma.$disconnect()
    console.log('✓ Database disconnected')
    
    return NextResponse.json({
      success: true,
      tests: {
        import: true,
        client: true,
        connect: true,
        query: true,
        projects: projectCount
      }
    })
    
  } catch (error) {
    console.error('=== Database Test Failed ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name || 'Unknown'
    }, { status: 500 })
  }
}