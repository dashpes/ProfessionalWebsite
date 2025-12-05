/**
 * Backlink Parser
 * Extracts internal blog post links from HTML content
 */

/**
 * Extract all internal blog post slugs from HTML content
 * Looks for links to /posts/[slug] patterns
 */
export function extractBacklinks(htmlContent: string, currentSlug?: string): string[] {
  // Match href attributes pointing to /posts/slug
  // Handles both relative (/posts/...) and absolute URLs (https://domain.com/posts/...)
  const regex = /href=["'](?:https?:\/\/[^\/]+)?\/posts\/([a-zA-Z0-9_-]+)["']/gi;

  const matches = [...htmlContent.matchAll(regex)];
  const slugs = matches.map(match => match[1]);

  // Remove duplicates and filter out self-references
  const uniqueSlugs = [...new Set(slugs)];

  if (currentSlug) {
    return uniqueSlugs.filter(slug => slug !== currentSlug);
  }

  return uniqueSlugs;
}

/**
 * Check if a string looks like a valid slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}
