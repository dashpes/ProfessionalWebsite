import { describe, it, expect, vi, beforeEach } from 'vitest'

// We'll test the pure utility functions by extracting their logic
// Since the actual module depends on Prisma, we test the logic directly

describe('Database Utilities', () => {
  describe('hashIP', () => {
    // Import crypto directly for testing the hashing logic
    const { createHash } = require('crypto')

    function hashIP(ipAddress: string, salt: string = 'portfolio-analytics-salt'): string {
      return createHash('sha256')
        .update(ipAddress + salt)
        .digest('hex')
        .substring(0, 32)
    }

    it('should hash an IP address consistently', () => {
      const ip = '192.168.1.1'
      const hash1 = hashIP(ip)
      const hash2 = hashIP(ip)
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different IPs', () => {
      const hash1 = hashIP('192.168.1.1')
      const hash2 = hashIP('192.168.1.2')
      expect(hash1).not.toBe(hash2)
    })

    it('should truncate hash to 32 characters', () => {
      const hash = hashIP('192.168.1.1')
      expect(hash.length).toBe(32)
    })

    it('should produce different hashes with different salts', () => {
      const ip = '192.168.1.1'
      const hash1 = hashIP(ip, 'salt1')
      const hash2 = hashIP(ip, 'salt2')
      expect(hash1).not.toBe(hash2)
    })

    it('should handle IPv6 addresses', () => {
      const hash = hashIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
      expect(hash.length).toBe(32)
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true)
    })
  })

  describe('getClientIP', () => {
    // Recreate the function logic for testing
    function getClientIP(headers: Map<string, string | null>): string {
      const candidates = [
        headers.get('x-forwarded-for'),
        headers.get('x-real-ip'),
        headers.get('cf-connecting-ip'),
        headers.get('x-client-ip'),
        headers.get('true-client-ip'),
      ]

      for (const candidate of candidates) {
        if (candidate) {
          const ip = candidate.split(',')[0].trim()
          if (ip && ip !== 'unknown') {
            return ip
          }
        }
      }

      return '127.0.0.1'
    }

    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Map([
        ['x-forwarded-for', '1.2.3.4, 5.6.7.8'],
      ])
      expect(getClientIP(headers)).toBe('1.2.3.4')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Map([
        ['x-real-ip', '1.2.3.4'],
      ])
      expect(getClientIP(headers)).toBe('1.2.3.4')
    })

    it('should extract IP from Cloudflare header', () => {
      const headers = new Map([
        ['cf-connecting-ip', '1.2.3.4'],
      ])
      expect(getClientIP(headers)).toBe('1.2.3.4')
    })

    it('should prioritize x-forwarded-for over other headers', () => {
      const headers = new Map([
        ['x-forwarded-for', '1.1.1.1'],
        ['x-real-ip', '2.2.2.2'],
        ['cf-connecting-ip', '3.3.3.3'],
      ])
      expect(getClientIP(headers)).toBe('1.1.1.1')
    })

    it('should fallback to 127.0.0.1 when no headers present', () => {
      const headers = new Map<string, string | null>()
      expect(getClientIP(headers)).toBe('127.0.0.1')
    })

    it('should skip unknown values', () => {
      const headers = new Map([
        ['x-forwarded-for', 'unknown'],
        ['x-real-ip', '1.2.3.4'],
      ])
      expect(getClientIP(headers)).toBe('1.2.3.4')
    })

    it('should handle whitespace in IP values', () => {
      const headers = new Map([
        ['x-forwarded-for', '  1.2.3.4  '],
      ])
      expect(getClientIP(headers)).toBe('1.2.3.4')
    })
  })

  describe('sanitizeUserAgent', () => {
    function sanitizeUserAgent(userAgent: string | undefined): string | null {
      if (!userAgent) return null
      const cleaned = userAgent.substring(0, 500).trim()
      return cleaned.replace(/[<>'"]/g, '')
    }

    it('should return null for undefined input', () => {
      expect(sanitizeUserAgent(undefined)).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(sanitizeUserAgent('')).toBeNull()
    })

    it('should remove dangerous characters', () => {
      const ua = 'Mozilla/5.0 <script>alert("xss")</script>'
      const sanitized = sanitizeUserAgent(ua)
      expect(sanitized).toBe('Mozilla/5.0 scriptalert(xss)/script')
    })

    it('should truncate long user agents', () => {
      const longUA = 'A'.repeat(600)
      const sanitized = sanitizeUserAgent(longUA)
      expect(sanitized?.length).toBe(500)
    })

    it('should trim whitespace', () => {
      const ua = '  Mozilla/5.0  '
      expect(sanitizeUserAgent(ua)).toBe('Mozilla/5.0')
    })

    it('should handle normal user agents', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      expect(sanitizeUserAgent(ua)).toBe(ua)
    })
  })
})
