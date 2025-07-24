import type { Metadata } from 'next'

// SEO Constants
export const SEO_CONSTANTS = {
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
  BRAND_COLORS: {
    primary: '#8b5cf6', // purple-500
    background: '#000000', // black
    foreground: '#ffffff', // white
  },
  DEFAULT_IMAGE: '/og-image.png',
  FAVICON: '/favicon.ico',
} as const

// Professional titles and keywords for SEO
export const PROFESSIONAL_KEYWORDS = [
  'Software Engineer',
  'Full Stack Developer', 
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'React Developer',
  'Next.js Developer',
  'TypeScript Developer',
  'Python Developer',
  'JavaScript Developer',
  'Data Analyst',
  'Web Developer',
  'Software Developer',
  'Orange County Developer',
  'California Developer',
  'Machine Learning Engineer',
  'Data Engineering',
  'Database Developer',
  'API Developer',
  'Cloud Developer'
] as const

// Technical skills from your website
export const TECHNICAL_SKILLS = [
  'React',
  'Next.js', 
  'TypeScript',
  'JavaScript',
  'Python',
  'Tailwind CSS',
  'Node.js',
  'PostgreSQL',
  'Prisma',
  'Git',
  'GitHub',
  'Vercel',
  'HTML',
  'CSS',
  'API Development',
  'Database Design',
  'Data Analysis',
  'Machine Learning',
  'Statistical Analysis',
  'Pandas',
  'NumPy',
  'Matplotlib',
  'Seaborn'
] as const

// Generate page-specific metadata
export function generateMetadata({
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
}): Metadata {
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
      creator: '@danielashpes' // Update if you have Twitter
    },
    authors: [{
      name: SEO_CONSTANTS.AUTHOR.name,
      url: SEO_CONSTANTS.SITE_URL
    }]
  }
}

// Generate structured data for Person schema
export function generatePersonSchema() {
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
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Orange County",
      "addressRegion": "CA",
      "addressCountry": "US"
    },
    "alumniOf": {
      "@type": "Organization",
      "name": "Georgia Institute of Technology",
      "description": "Master's in Analytics (Current)"
    },
    "knowsAbout": TECHNICAL_SKILLS,
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Software Engineer",
      "occupationLocation": {
        "@type": "City",
        "name": "Orange County, California"
      }
    }
  }
}

// Generate structured data for Website schema
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONSTANTS.SITE_NAME,
    "url": SEO_CONSTANTS.SITE_URL,
    "author": {
      "@type": "Person",
      "name": SEO_CONSTANTS.AUTHOR.name
    },
    "description": "Professional portfolio showcasing software engineering projects, data science work, and technical expertise.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SEO_CONSTANTS.SITE_URL}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }
}

// Generate blog post structured data
export function generateBlogPostSchema({
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
    "publisher": {
      "@type": "Person",
      "name": SEO_CONSTANTS.AUTHOR.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONSTANTS.SITE_URL}/logo.png`
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "url": url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  }
}