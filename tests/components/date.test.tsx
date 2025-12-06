import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateFormatter } from '@/app/components/date'

describe('DateFormatter Component', () => {
  it('should render a time element', () => {
    render(<DateFormatter dateString="2024-01-15" />)
    const timeElement = screen.getByRole('time')
    expect(timeElement).toBeInTheDocument()
  })

  it('should have correct datetime attribute', () => {
    render(<DateFormatter dateString="2024-01-15" />)
    const timeElement = screen.getByRole('time')
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15')
  })

  it('should format date correctly', () => {
    render(<DateFormatter dateString="2024-01-15" />)
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should format different dates correctly', () => {
    const { rerender } = render(<DateFormatter dateString="2024-12-25" />)
    expect(screen.getByText('December 25, 2024')).toBeInTheDocument()

    rerender(<DateFormatter dateString="2023-07-04" />)
    expect(screen.getByText('July 4, 2023')).toBeInTheDocument()

    rerender(<DateFormatter dateString="2022-03-01" />)
    expect(screen.getByText('March 1, 2022')).toBeInTheDocument()
  })

  it('should handle different months', () => {
    const months = [
      { date: '2024-01-01', expected: 'January 1, 2024' },
      { date: '2024-02-14', expected: 'February 14, 2024' },
      { date: '2024-03-17', expected: 'March 17, 2024' },
      { date: '2024-04-01', expected: 'April 1, 2024' },
      { date: '2024-05-05', expected: 'May 5, 2024' },
      { date: '2024-06-21', expected: 'June 21, 2024' },
      { date: '2024-07-04', expected: 'July 4, 2024' },
      { date: '2024-08-15', expected: 'August 15, 2024' },
      { date: '2024-09-22', expected: 'September 22, 2024' },
      { date: '2024-10-31', expected: 'October 31, 2024' },
      { date: '2024-11-28', expected: 'November 28, 2024' },
      { date: '2024-12-25', expected: 'December 25, 2024' },
    ]

    months.forEach(({ date, expected }) => {
      const { unmount } = render(<DateFormatter dateString={date} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle ISO date strings', () => {
    render(<DateFormatter dateString="2024-01-15T10:30:00Z" />)
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should handle ISO date strings with timezone', () => {
    render(<DateFormatter dateString="2024-06-15T00:00:00-08:00" />)
    // Date parsing may vary by timezone, but the format should be consistent
    const timeElement = screen.getByRole('time')
    expect(timeElement).toHaveAttribute('datetime', '2024-06-15T00:00:00-08:00')
  })
})

describe('Date Formatting', () => {
  // Test the date formatting logic directly
  const { parseISO, format } = require('date-fns')

  it('should parse ISO date strings', () => {
    const date = parseISO('2024-01-15')
    expect(date).toBeInstanceOf(Date)
  })

  it('should format dates in "LLLL d, yyyy" format', () => {
    const date = parseISO('2024-01-15')
    const formatted = format(date, 'LLLL d, yyyy')
    expect(formatted).toBe('January 15, 2024')
  })

  it('should handle leap year dates', () => {
    const date = parseISO('2024-02-29')
    const formatted = format(date, 'LLLL d, yyyy')
    expect(formatted).toBe('February 29, 2024')
  })

  it('should handle end of year dates', () => {
    const date = parseISO('2024-12-31')
    const formatted = format(date, 'LLLL d, yyyy')
    expect(formatted).toBe('December 31, 2024')
  })
})
