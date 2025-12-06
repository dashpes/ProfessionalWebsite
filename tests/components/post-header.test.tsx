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

vi.mock('@/app/components/post-title', () => ({
  PostTitle: ({ children }: { children: React.ReactNode }) => <h1 data-testid="post-title">{children}</h1>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}))

vi.mock('lucide-react', () => ({
  Clock: () => <span data-testid="clock-icon">🕐</span>,
  Eye: () => <span data-testid="eye-icon">👁</span>,
}))

import { PostHeader } from '@/app/components/post-header'

describe('PostHeader Component', () => {
  const defaultProps = {
    title: 'Test Blog Post',
    coverImage: '/images/test.jpg',
    date: '2024-01-15',
    author: {
      name: 'Jane Doe',
      picture: '/images/author.jpg',
    },
  }

  it('should render the post title', () => {
    render(<PostHeader {...defaultProps} />)
    expect(screen.getByTestId('post-title')).toHaveTextContent('Test Blog Post')
  })

  it('should render the cover image', () => {
    render(<PostHeader {...defaultProps} />)
    expect(screen.getByTestId('cover-image')).toBeInTheDocument()
  })

  it('should render the date', () => {
    render(<PostHeader {...defaultProps} />)
    expect(screen.getByTestId('date')).toHaveTextContent('2024-01-15')
  })

  it('should render the author avatar', () => {
    render(<PostHeader {...defaultProps} />)
    const avatars = screen.getAllByTestId('avatar')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('should render reading time when provided', () => {
    render(<PostHeader {...defaultProps} readingTime={5} />)
    expect(screen.getByText('5 min read')).toBeInTheDocument()
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
  })

  it('should not render reading time when not provided', () => {
    render(<PostHeader {...defaultProps} />)
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument()
  })

  it('should render view count when provided', () => {
    render(<PostHeader {...defaultProps} viewCount={100} />)
    expect(screen.getByText('100 views')).toBeInTheDocument()
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
  })

  it('should render view count of 0', () => {
    render(<PostHeader {...defaultProps} viewCount={0} />)
    expect(screen.getByText('0 views')).toBeInTheDocument()
  })

  it('should not render view count when not provided', () => {
    render(<PostHeader {...defaultProps} />)
    expect(screen.queryByText(/views/)).not.toBeInTheDocument()
  })

  it('should render categories when provided', () => {
    const categories = [
      { id: '1', name: 'Technology', slug: 'technology' },
      { id: '2', name: 'Design', slug: 'design' },
    ]
    render(<PostHeader {...defaultProps} categories={categories} />)

    expect(screen.getByText('Categories:')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('should not render categories section when empty', () => {
    render(<PostHeader {...defaultProps} categories={[]} />)
    expect(screen.queryByText('Categories:')).not.toBeInTheDocument()
  })

  it('should render tags when provided', () => {
    const tags = [
      { id: '1', name: 'JavaScript', slug: 'javascript' },
      { id: '2', name: 'React', slug: 'react' },
    ]
    render(<PostHeader {...defaultProps} tags={tags} />)

    expect(screen.getByText('Tags:')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('should render both categories and tags', () => {
    const categories = [{ id: '1', name: 'Tech', slug: 'tech' }]
    const tags = [{ id: '1', name: 'TypeScript', slug: 'typescript' }]

    render(<PostHeader {...defaultProps} categories={categories} tags={tags} />)

    expect(screen.getByText('Categories:')).toBeInTheDocument()
    expect(screen.getByText('Tags:')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
