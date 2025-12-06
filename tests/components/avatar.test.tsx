import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the UI Avatar components
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-root" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}))

import { Avatar, UserAvatar } from '@/app/components/avatar'

describe('Avatar Component', () => {
  it('should render avatar container', () => {
    render(<Avatar fallback="JD" />)
    expect(screen.getByTestId('avatar-root')).toBeInTheDocument()
  })

  it('should always render fallback', () => {
    render(<Avatar fallback="John Doe" />)
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render image when src is provided', () => {
    render(<Avatar src="/avatar.jpg" fallback="JD" />)
    const image = screen.getByTestId('avatar-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/avatar.jpg')
  })

  it('should not render image when src is not provided', () => {
    render(<Avatar fallback="JD" />)
    expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument()
  })

  it('should set alt text on image', () => {
    render(<Avatar src="/avatar.jpg" alt="User avatar" fallback="JD" />)
    const image = screen.getByTestId('avatar-image')
    expect(image).toHaveAttribute('alt', 'User avatar')
  })

  it('should apply custom className', () => {
    render(<Avatar fallback="JD" className="custom-class" />)
    expect(screen.getByTestId('avatar-root')).toHaveClass('custom-class')
  })

  it('should handle empty fallback', () => {
    render(<Avatar fallback="" />)
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument()
  })

  it('should display initials as fallback', () => {
    render(<Avatar fallback="DA" />)
    expect(screen.getByText('DA')).toBeInTheDocument()
  })
})

describe('UserAvatar Export', () => {
  it('should export as both Avatar and UserAvatar', () => {
    // Both should render the same component
    const { unmount: unmount1 } = render(<Avatar fallback="Test" />)
    expect(screen.getByTestId('avatar-root')).toBeInTheDocument()
    unmount1()

    render(<UserAvatar fallback="Test" />)
    expect(screen.getByTestId('avatar-root')).toBeInTheDocument()
  })
})
