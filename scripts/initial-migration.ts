/**
 * Initial migration script to populate database from GitHub API
 * This script runs once to set up the initial project data
 */

import { githubSyncService } from '../lib/github-sync.js'

async function runInitialMigration() {
  console.log('🚀 Starting initial database migration...')
  console.log('This will populate the database with projects from GitHub API')
  
  try {
    const result = await githubSyncService.syncAllProjects('initial_migration')
    
    console.log('\n✅ Migration completed!')
    console.log(`📊 Results:`)
    console.log(`   • Created: ${result.created} projects`)
    console.log(`   • Updated: ${result.updated} projects`)
    console.log(`   • Total: ${result.created + result.updated} projects`)
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`)
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
    
    if (result.syncedProjects.length > 0) {
      console.log(`\n📁 Synced projects:`)
      result.syncedProjects.forEach(project => {
        console.log(`   • ${project}`)
      })
    }
    
    console.log('\n🎉 Database is now ready!')
    console.log('You can now use the admin panel to manage projects and trigger future syncs.')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runInitialMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })