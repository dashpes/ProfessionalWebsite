/**
 * Simple test script to verify GitHub sync functionality
 */

console.log('🧪 Testing GitHub sync...')

// Test database connection
async function testConnection() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const db = new PrismaClient()
    
    await db.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Test if we can create a simple technology entry
    const testTech = await db.technology.upsert({
      where: { name: 'Test Technology' },
      update: {},
      create: {
        name: 'Test Technology',
        category: 'OTHER'
      }
    })
    
    console.log('✅ Database write test successful')
    
    // Clean up test data
    await db.technology.delete({
      where: { id: testTech.id }
    })
    
    console.log('✅ Database cleanup successful')
    console.log('🎉 Database is ready for GitHub sync!')
    
    await db.$disconnect()
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  }
}

testConnection()