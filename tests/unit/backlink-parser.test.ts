import { describe, it, expect } from 'vitest'
import { extractBacklinks, isValidSlug } from '@/lib/backlink-parser'

describe('Backlink Parser', () => {
  describe('extractBacklinks', () => {
    it('should extract slugs from relative blog post links', () => {
      const html = '<a href="/posts/my-first-post">Link</a>'
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['my-first-post'])
    })

    it('should extract slugs from absolute blog post links', () => {
      const html = '<a href="https://example.com/posts/my-post">Link</a>'
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['my-post'])
    })

    it('should extract multiple unique slugs', () => {
      const html = `
        <a href="/posts/first-post">First</a>
        <a href="/posts/second-post">Second</a>
        <a href="/posts/third-post">Third</a>
      `
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['first-post', 'second-post', 'third-post'])
    })

    it('should remove duplicate slugs', () => {
      const html = `
        <a href="/posts/same-post">Link 1</a>
        <a href="/posts/same-post">Link 2</a>
      `
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['same-post'])
    })

    it('should filter out self-references when currentSlug is provided', () => {
      const html = `
        <a href="/posts/my-current-post">Self</a>
        <a href="/posts/other-post">Other</a>
      `
      const slugs = extractBacklinks(html, 'my-current-post')
      expect(slugs).toEqual(['other-post'])
    })

    it('should handle slugs with underscores and hyphens', () => {
      const html = '<a href="/posts/post_with_underscores">Link</a><a href="/posts/post-with-hyphens">Link2</a>'
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['post_with_underscores', 'post-with-hyphens'])
    })

    it('should handle slugs with numbers', () => {
      const html = '<a href="/posts/post-2024-01">Link</a>'
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['post-2024-01'])
    })

    it('should return empty array when no links are found', () => {
      const html = '<p>No links here</p>'
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual([])
    })

    it('should not match non-post URLs', () => {
      const html = `
        <a href="/about">About</a>
        <a href="/projects/my-project">Project</a>
        <a href="https://external.com">External</a>
      `
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual([])
    })

    it('should handle both single and double quotes', () => {
      const html = `
        <a href='/posts/single-quotes'>Single</a>
        <a href="/posts/double-quotes">Double</a>
      `
      const slugs = extractBacklinks(html)
      expect(slugs).toEqual(['single-quotes', 'double-quotes'])
    })
  })

  describe('isValidSlug', () => {
    it('should return true for valid slugs', () => {
      expect(isValidSlug('my-post')).toBe(true)
      expect(isValidSlug('my_post')).toBe(true)
      expect(isValidSlug('post123')).toBe(true)
      expect(isValidSlug('my-post-2024')).toBe(true)
    })

    it('should return false for invalid slugs', () => {
      expect(isValidSlug('my post')).toBe(false) // spaces
      expect(isValidSlug('my.post')).toBe(false) // dots
      expect(isValidSlug('my/post')).toBe(false) // slashes
      expect(isValidSlug('')).toBe(false) // empty
    })

    it('should handle edge cases', () => {
      expect(isValidSlug('a')).toBe(true)
      expect(isValidSlug('A')).toBe(true)
      expect(isValidSlug('123')).toBe(true)
      expect(isValidSlug('---')).toBe(true)
      expect(isValidSlug('___')).toBe(true)
    })
  })
})
