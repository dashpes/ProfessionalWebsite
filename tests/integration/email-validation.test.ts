import { describe, it, expect } from 'vitest'

describe('Email Validation', () => {
  // Standard email regex used across the codebase
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  describe('Valid Email Addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user123@example.com',
      'test@subdomain.example.com',
      'test@example.co.uk',
      'a@b.co',
      '123@456.com',
      'test_email@example.com',
      'test-email@example.com',
    ]

    validEmails.forEach(email => {
      it(`should accept "${email}"`, () => {
        expect(emailRegex.test(email)).toBe(true)
      })
    })
  })

  describe('Invalid Email Addresses', () => {
    const invalidEmails = [
      '',
      'plainaddress',
      '@missinglocal.com',
      'missing@.com',
      'missing.com',
      'missing@domain',
      'spaces in@email.com',
      'email@space .com',
      'email@ space.com',
      '@',
      '@@',
      '.@.',
      'multiple@@at.com',
    ]

    invalidEmails.forEach(email => {
      it(`should reject "${email}"`, () => {
        expect(emailRegex.test(email)).toBe(false)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long local parts', () => {
      const longLocal = 'a'.repeat(64) + '@example.com'
      expect(emailRegex.test(longLocal)).toBe(true)
    })

    it('should handle very long domain names', () => {
      const longDomain = 'test@' + 'a'.repeat(63) + '.com'
      expect(emailRegex.test(longDomain)).toBe(true)
    })

    it('should handle emails with numbers', () => {
      expect(emailRegex.test('user123@domain456.com')).toBe(true)
    })

    it('should handle TLDs of various lengths', () => {
      expect(emailRegex.test('test@example.co')).toBe(true)
      expect(emailRegex.test('test@example.com')).toBe(true)
      expect(emailRegex.test('test@example.info')).toBe(true)
      expect(emailRegex.test('test@example.museum')).toBe(true)
    })
  })
})

describe('Email Normalization', () => {
  it('should lowercase emails for consistency', () => {
    const email = 'TEST@EXAMPLE.COM'
    const normalized = email.toLowerCase()
    expect(normalized).toBe('test@example.com')
  })

  it('should trim whitespace', () => {
    const email = '  test@example.com  '
    const normalized = email.trim()
    expect(normalized).toBe('test@example.com')
  })

  it('should handle mixed case domains', () => {
    const email = 'user@EXAMPLE.COM'
    const normalized = email.toLowerCase()
    expect(normalized).toBe('user@example.com')
  })
})

describe('Newsletter Email Validation', () => {
  // Tests specific to newsletter subscription
  it('should accept standard work emails', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('john.doe@company.com')).toBe(true)
  })

  it('should accept personal emails', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('user123@gmail.com')).toBe(true)
    expect(emailRegex.test('user@yahoo.com')).toBe(true)
    expect(emailRegex.test('user@outlook.com')).toBe(true)
  })

  it('should accept international domains', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('user@example.de')).toBe(true)
    expect(emailRegex.test('user@example.fr')).toBe(true)
    expect(emailRegex.test('user@example.co.uk')).toBe(true)
  })
})

describe('Contact Form Email Validation', () => {
  // Tests specific to contact form
  it('should accept reply-to addresses', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('contact@business.com')).toBe(true)
  })

  it('should validate sender email for responses', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const senderEmail = 'visitor@their-company.com'
    expect(emailRegex.test(senderEmail)).toBe(true)
  })
})
