import { describe, it, expect } from 'vitest'

// Import or recreate SEO utilities for testing
const SEO_CONSTANTS = {
  SITE_NAME: 'Daniel Ashpes - Portfolio',
  SITE_URL: 'https://danielashpes.com',
  AUTHOR: {
    name: 'Daniel Ashpes',
    email: 'dan@danielashpes.com',
    jobTitle: 'Software Engineer & Full Stack Developer',
    location: 'Orange County, California',
    github: 'https://github.com/dashpes',
    linkedin: 'https://www.linkedin.com/in/danielashpes'
  },
  DEFAULT_IMAGE: '/og-image.png',
}

const PROFESSIONAL_KEYWORDS = [
  'Software Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
]

const TECHNICAL_SKILLS = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Python',
]

function generateMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
  type = 'website'
}: {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
  type?: 'website' | 'article' | 'profile'
}) {
  const url = `${SEO_CONSTANTS.SITE_URL}${path}`
  const ogImage = image || SEO_CONSTANTS.DEFAULT_IMAGE

  return {
    metadataBase: new URL(SEO_CONSTANTS.SITE_URL),
    title,
    description,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: {
      canonical: url
    },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: SEO_CONSTANTS.SITE_NAME,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title
      }],
      locale: 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@danielashpes'
    },
    authors: [{
      name: SEO_CONSTANTS.AUTHOR.name,
      url: SEO_CONSTANTS.SITE_URL
    }]
  }
}

function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": SEO_CONSTANTS.AUTHOR.name,
    "jobTitle": SEO_CONSTANTS.AUTHOR.jobTitle,
    "email": SEO_CONSTANTS.AUTHOR.email,
    "url": SEO_CONSTANTS.SITE_URL,
    "sameAs": [
      SEO_CONSTANTS.AUTHOR.github,
      SEO_CONSTANTS.AUTHOR.linkedin
    ],
  }
}

function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONSTANTS.SITE_NAME,
    "url": SEO_CONSTANTS.SITE_URL,
    "author": {
      "@type": "Person",
      "name": SEO_CONSTANTS.AUTHOR.name
    },
  }
}

function generateBlogPostSchema({
  title,
  description,
  datePublished,
  dateModified,
  url,
  image
}: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  image?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image || SEO_CONSTANTS.DEFAULT_IMAGE,
    "author": {
      "@type": "Person",
      "name": SEO_CONSTANTS.AUTHOR.name,
      "url": SEO_CONSTANTS.SITE_URL
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "url": url,
  }
}

describe('SEO Constants', () => {
  it('should have valid site URL', () => {
    expect(SEO_CONSTANTS.SITE_URL).toMatch(/^https:\/\//)
  })

  it('should have author information', () => {
    expect(SEO_CONSTANTS.AUTHOR.name).toBeTruthy()
    expect(SEO_CONSTANTS.AUTHOR.email).toMatch(/@/)
    expect(SEO_CONSTANTS.AUTHOR.github).toMatch(/github\.com/)
    expect(SEO_CONSTANTS.AUTHOR.linkedin).toMatch(/linkedin\.com/)
  })

  it('should have professional keywords', () => {
    expect(PROFESSIONAL_KEYWORDS.length).toBeGreaterThan(0)
    expect(PROFESSIONAL_KEYWORDS).toContain('Software Engineer')
    expect(PROFESSIONAL_KEYWORDS).toContain('Full Stack Developer')
  })

  it('should have technical skills', () => {
    expect(TECHNICAL_SKILLS.length).toBeGreaterThan(0)
    expect(TECHNICAL_SKILLS).toContain('React')
    expect(TECHNICAL_SKILLS).toContain('TypeScript')
  })
})

describe('generateMetadata', () => {
  it('should generate basic metadata', () => {
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'Test description',
    })

    expect(metadata.title).toBe('Test Page')
    expect(metadata.description).toBe('Test description')
  })

  it('should generate canonical URL with path', () => {
    const metadata = generateMetadata({
      title: 'Blog Post',
      description: 'A blog post',
      path: '/blog/my-post',
    })

    expect(metadata.alternates?.canonical).toBe('https://danielashpes.com/blog/my-post')
  })

  it('should use default image when none provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test',
    })

    expect(metadata.openGraph?.images?.[0].url).toBe('/og-image.png')
  })

  it('should use custom image when provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test',
      image: '/custom-image.png',
    })

    expect(metadata.openGraph?.images?.[0].url).toBe('/custom-image.png')
  })

  it('should set noindex when specified', () => {
    const indexable = generateMetadata({
      title: 'Public',
      description: 'Public page',
    })
    const noIndex = generateMetadata({
      title: 'Private',
      description: 'Private page',
      noIndex: true,
    })

    expect(indexable.robots).toBe('index,follow')
    expect(noIndex.robots).toBe('noindex,nofollow')
  })

  it('should set correct OpenGraph type', () => {
    const website = generateMetadata({
      title: 'Home',
      description: 'Home page',
      type: 'website',
    })
    const article = generateMetadata({
      title: 'Blog',
      description: 'Blog post',
      type: 'article',
    })

    expect(website.openGraph?.type).toBe('website')
    expect(article.openGraph?.type).toBe('article')
  })

  it('should include Twitter card metadata', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test description',
    })

    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.twitter?.title).toBe('Test')
    expect(metadata.twitter?.description).toBe('Test description')
  })

  it('should include author information', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test',
    })

    expect(metadata.authors?.[0].name).toBe('Daniel Ashpes')
    expect(metadata.authors?.[0].url).toBe(SEO_CONSTANTS.SITE_URL)
  })
})

describe('generatePersonSchema', () => {
  it('should generate valid Person schema', () => {
    const schema = generatePersonSchema()

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toBe('Daniel Ashpes')
    expect(schema.jobTitle).toBeTruthy()
    expect(schema.email).toMatch(/@/)
  })

  it('should include social links', () => {
    const schema = generatePersonSchema()

    expect(schema.sameAs).toContain(SEO_CONSTANTS.AUTHOR.github)
    expect(schema.sameAs).toContain(SEO_CONSTANTS.AUTHOR.linkedin)
  })
})

describe('generateWebsiteSchema', () => {
  it('should generate valid WebSite schema', () => {
    const schema = generateWebsiteSchema()

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('WebSite')
    expect(schema.name).toBe(SEO_CONSTANTS.SITE_NAME)
    expect(schema.url).toBe(SEO_CONSTANTS.SITE_URL)
  })

  it('should include author', () => {
    const schema = generateWebsiteSchema()

    expect(schema.author['@type']).toBe('Person')
    expect(schema.author.name).toBe(SEO_CONSTANTS.AUTHOR.name)
  })
})

describe('generateBlogPostSchema', () => {
  it('should generate valid BlogPosting schema', () => {
    const schema = generateBlogPostSchema({
      title: 'My Blog Post',
      description: 'A great article',
      datePublished: '2024-01-15',
      url: 'https://danielashpes.com/blog/my-post',
    })

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('BlogPosting')
    expect(schema.headline).toBe('My Blog Post')
    expect(schema.description).toBe('A great article')
    expect(schema.datePublished).toBe('2024-01-15')
  })

  it('should use datePublished as dateModified fallback', () => {
    const schema = generateBlogPostSchema({
      title: 'Post',
      description: 'Description',
      datePublished: '2024-01-15',
      url: 'https://example.com/post',
    })

    expect(schema.dateModified).toBe('2024-01-15')
  })

  it('should use custom dateModified when provided', () => {
    const schema = generateBlogPostSchema({
      title: 'Post',
      description: 'Description',
      datePublished: '2024-01-15',
      dateModified: '2024-02-20',
      url: 'https://example.com/post',
    })

    expect(schema.dateModified).toBe('2024-02-20')
  })

  it('should use default image when none provided', () => {
    const schema = generateBlogPostSchema({
      title: 'Post',
      description: 'Description',
      datePublished: '2024-01-15',
      url: 'https://example.com/post',
    })

    expect(schema.image).toBe('/og-image.png')
  })

  it('should use custom image when provided', () => {
    const schema = generateBlogPostSchema({
      title: 'Post',
      description: 'Description',
      datePublished: '2024-01-15',
      url: 'https://example.com/post',
      image: '/blog/my-post-image.png',
    })

    expect(schema.image).toBe('/blog/my-post-image.png')
  })
})
