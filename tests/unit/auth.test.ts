import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

describe('Auth Utilities', () => {
  const JWT_SECRET = 'test-secret-key'

  describe('JWT Token Verification', () => {
    // Recreate the verification logic for testing
    function verifyAdminToken(token: string | null, secret: string = JWT_SECRET): { valid: boolean; admin?: boolean } {
      try {
        if (!token) {
          return { valid: false }
        }

        const decoded = jwt.verify(token, secret) as { admin?: boolean }
        return { valid: decoded.admin === true, admin: decoded.admin }
      } catch {
        return { valid: false }
      }
    }

    it('should return valid true for admin token', () => {
      const token = jwt.sign({ admin: true }, JWT_SECRET)
      const result = verifyAdminToken(token)
      expect(result.valid).toBe(true)
      expect(result.admin).toBe(true)
    })

    it('should return valid false for non-admin token', () => {
      const token = jwt.sign({ admin: false }, JWT_SECRET)
      const result = verifyAdminToken(token)
      expect(result.valid).toBe(false)
      expect(result.admin).toBe(false)
    })

    it('should return valid false for missing admin claim', () => {
      const token = jwt.sign({ userId: '123' }, JWT_SECRET)
      const result = verifyAdminToken(token)
      expect(result.valid).toBe(false)
    })

    it('should return valid false for null token', () => {
      const result = verifyAdminToken(null)
      expect(result.valid).toBe(false)
    })

    it('should return valid false for empty token', () => {
      const result = verifyAdminToken('')
      expect(result.valid).toBe(false)
    })

    it('should return valid false for malformed token', () => {
      const result = verifyAdminToken('not-a-valid-token')
      expect(result.valid).toBe(false)
    })

    it('should return valid false for wrong secret', () => {
      const token = jwt.sign({ admin: true }, JWT_SECRET)
      const result = verifyAdminToken(token, 'wrong-secret')
      expect(result.valid).toBe(false)
    })

    it('should return valid false for expired token', () => {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '-1h' })
      const result = verifyAdminToken(token)
      expect(result.valid).toBe(false)
    })
  })

  describe('Authorization Header Parsing', () => {
    function parseAuthHeader(authHeader: string | null): string | null {
      if (!authHeader || authHeader === '') return null
      return authHeader.replace('Bearer ', '')
    }

    it('should extract token from Bearer header', () => {
      const header = 'Bearer my-token-123'
      expect(parseAuthHeader(header)).toBe('my-token-123')
    })

    it('should return null for null header', () => {
      expect(parseAuthHeader(null)).toBeNull()
    })

    it('should handle token without Bearer prefix', () => {
      const header = 'just-a-token'
      expect(parseAuthHeader(header)).toBe('just-a-token')
    })

    it('should handle empty string', () => {
      // Empty string is treated as missing, returns null
      expect(parseAuthHeader('')).toBeNull()
    })
  })
})
