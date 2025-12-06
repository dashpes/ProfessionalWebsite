import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the child components
vi.mock('@/app/components/avatar', () => ({
  Avatar: ({ fallback }: { fallback: string }) => <div data-testid="avatar">{fallback}</div>,
}))

vi.mock('@/app/components/date', () => ({
  DateFormatter: ({ dateString }: { dateString: string }) => <span data-testid="date">{dateString}</span>,
}))

vi.mock('@/app/components/cover-image', () => ({
  CoverImage: ({ title }: { title: string }) => <div data-testid="cover-image">{title}</div>,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}))

import { PostPreview } from '@/app/components/post-preview'

describe('PostPreview Component', () => {
  const defaultProps = {
    title: 'Test Post Title',
    coverImage: '/images/test.jpg',
    date: '2024-01-15',
    excerpt: 'This is a test excerpt for the blog post.',
    author: {
      name: 'John Doe',
      picture: '/images/author.jpg',
    },
    slug: 'test-post-title',
  }

  it('should render the post title', () => {
    render(<PostPreview {...defaultProps} />)
    // Title appears in both cover image and link, so use getAllByText
    const titles = screen.getAllByText('Test Post Title')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('should render the title as a link to the post', () => {
    render(<PostPreview {...defaultProps} />)
    const link = screen.getByTestId('link')
    expect(link).toHaveAttribute('href', '/posts/test-post-title')
  })

  it('should render the excerpt', () => {
    render(<PostPreview {...defaultProps} />)
    expect(screen.getByText('This is a test excerpt for the blog post.')).toBeInTheDocument()
  })

  it('should render the date formatter', () => {
    render(<PostPreview {...defaultProps} />)
    expect(screen.getByTestId('date')).toBeInTheDocument()
    expect(screen.getByTestId('date')).toHaveTextContent('2024-01-15')
  })

  it('should render the cover image', () => {
    render(<PostPreview {...defaultProps} />)
    expect(screen.getByTestId('cover-image')).toBeInTheDocument()
  })

  it('should render the author avatar', () => {
    render(<PostPreview {...defaultProps} />)
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(screen.getByTestId('avatar')).toHaveTextContent('John Doe')
  })

  it('should have hover transition classes', () => {
    const { container } = render(<PostPreview {...defaultProps} />)
    const card = container.firstChild
    expect(card).toHaveClass('transition-all')
    expect(card).toHaveClass('hover:transform')
  })
})
