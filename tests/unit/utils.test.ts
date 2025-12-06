import { describe, it, expect } from 'vitest'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Recreate the cn function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

describe('cn (Class Name Utility)', () => {
  describe('basic functionality', () => {
    it('should join class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle single class name', () => {
      expect(cn('foo')).toBe('foo')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })

    it('should filter out falsy values', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar')
      expect(cn('foo', null, 'bar')).toBe('foo bar')
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
      expect(cn('foo', '', 'bar')).toBe('foo bar')
    })
  })

  describe('conditional classes', () => {
    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false

      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
    })

    it('should handle objects with truthy/falsy values', () => {
      expect(cn({
        'foo': true,
        'bar': false,
        'baz': true,
      })).toBe('foo baz')
    })
  })

  describe('Tailwind merge functionality', () => {
    it('should merge conflicting Tailwind classes', () => {
      // Later classes should override earlier ones
      expect(cn('p-4', 'p-6')).toBe('p-6')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should merge responsive classes correctly', () => {
      expect(cn('md:p-4', 'md:p-6')).toBe('md:p-6')
    })

    it('should preserve non-conflicting classes', () => {
      expect(cn('p-4', 'm-4')).toBe('p-4 m-4')
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle arbitrary values', () => {
      expect(cn('p-[20px]', 'p-4')).toBe('p-4')
    })
  })

  describe('array inputs', () => {
    it('should handle arrays of class names', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('should handle nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz')
    })

    it('should handle mixed arrays and strings', () => {
      expect(cn('foo', ['bar', 'baz'], 'qux')).toBe('foo bar baz qux')
    })
  })

  describe('edge cases', () => {
    it('should handle numbers', () => {
      expect(cn('foo', 0, 'bar')).toBe('foo bar')
    })

    it('should handle duplicate classes', () => {
      // clsx preserves duplicates, twMerge handles conflicts
      const result = cn('foo', 'foo', 'bar')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })

    it('should trim whitespace', () => {
      expect(cn('  foo  ', '  bar  ')).toBe('foo bar')
    })
  })

  describe('common patterns', () => {
    it('should handle button variants pattern', () => {
      const variant = 'primary'
      const size = 'md'

      const result = cn(
        'rounded font-medium',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-white',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg'
      )

      expect(result).toBe('rounded font-medium bg-blue-500 text-white px-4 py-2')
    })

    it('should handle component prop merging', () => {
      const baseClasses = 'flex items-center justify-center p-4'
      const customClasses = 'p-6 bg-red-500'

      expect(cn(baseClasses, customClasses)).toBe('flex items-center justify-center p-6 bg-red-500')
    })

    it('should handle responsive design patterns', () => {
      const result = cn(
        'grid grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4'
      )

      expect(result).toBe('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4')
    })

    it('should handle hover and focus states', () => {
      const result = cn(
        'bg-blue-500',
        'hover:bg-blue-600',
        'focus:ring-2',
        'focus:ring-blue-300'
      )

      expect(result).toBe('bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300')
    })
  })
})
