import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing categories and tags...\n')

  // Delete garbage category "T"
  try {
    await prisma.blogCategory.delete({
      where: { slug: 't' }
    })
    console.log('✓ Deleted garbage category "T"')
  } catch {
    console.log('- Category "T" not found or already deleted')
  }

  // Delete garbage tag "t"
  try {
    await prisma.blogTag.delete({
      where: { slug: 't' }
    })
    console.log('✓ Deleted garbage tag "t"')
  } catch {
    console.log('- Tag "t" not found or already deleted')
  }

  // Rename "Engineering" to "Software Engineering" if it exists
  try {
    await prisma.blogCategory.update({
      where: { slug: 'engineering' },
      data: {
        name: 'Software Engineering',
        slug: 'software-engineering',
        color: '#5B2C91'  // Purple
      }
    })
    console.log('✓ Renamed "Engineering" to "Software Engineering"')
  } catch {
    console.log('- Category "Engineering" not found')
  }

  // Add "Data Science" category if it doesn't exist
  try {
    await prisma.blogCategory.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        color: '#2E86AB',  // Blue
        description: 'Data science, machine learning, and analytics'
      }
    })
    console.log('✓ Added/verified "Data Science" category')
  } catch (e) {
    console.log('- Error with Data Science category:', e)
  }

  // Add "Projects" category if it doesn't exist
  try {
    await prisma.blogCategory.upsert({
      where: { slug: 'projects' },
      update: {},
      create: {
        name: 'Projects',
        slug: 'projects',
        color: '#A23B72',  // Magenta
        description: 'Portfolio projects and case studies'
      }
    })
    console.log('✓ Added/verified "Projects" category')
  } catch (e) {
    console.log('- Error with Projects category:', e)
  }

  // List final categories
  const categories = await prisma.blogCategory.findMany()
  console.log('\nFinal categories:')
  categories.forEach(c => console.log(`  - ${c.name} (${c.slug}) - ${c.color}`))

  // List final tags
  const tags = await prisma.blogTag.findMany()
  console.log('\nFinal tags:')
  tags.forEach(t => console.log(`  - ${t.name} (${t.slug})`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
