import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link" {...props}>
      {children}
    </a>
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Github: () => <span data-testid="github-icon">GitHub</span>,
  Linkedin: () => <span data-testid="linkedin-icon">LinkedIn</span>,
}))

import Footer from '@/app/components/footer'

describe('Footer Component', () => {
  it('should render the footer', () => {
    render(<Footer />)
    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should display current year in copyright', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
  })

  it('should display copyright with name', () => {
    render(<Footer />)
    expect(screen.getByText(/Daniel Ashpes/)).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  it('should have admin link', () => {
    render(<Footer />)
    const adminLink = screen.getByText('Admin')
    expect(adminLink).toBeInTheDocument()
    expect(adminLink.closest('a')).toHaveAttribute('href', '/admin')
  })

  it('should have GitHub social link', () => {
    render(<Footer />)
    const githubIcon = screen.getByTestId('github-icon')
    expect(githubIcon).toBeInTheDocument()

    const githubLink = githubIcon.closest('a')
    expect(githubLink).toHaveAttribute('href', 'https://github.com/dashpes')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have LinkedIn social link', () => {
    render(<Footer />)
    const linkedinIcon = screen.getByTestId('linkedin-icon')
    expect(linkedinIcon).toBeInTheDocument()

    const linkedinLink = linkedinIcon.closest('a')
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/danielashpes')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have navigation links', () => {
    render(<Footer />)

    const homeLink = screen.getByText('Home')
    const aboutLink = screen.getByText('About')
    const projectsLink = screen.getByText('Projects')
    const blogLink = screen.getByText('Blog')
    const contactLink = screen.getByText('Contact')

    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    expect(aboutLink.closest('a')).toHaveAttribute('href', '/about')
    expect(projectsLink.closest('a')).toHaveAttribute('href', '/projects')
    expect(blogLink.closest('a')).toHaveAttribute('href', '/blog')
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact')
  })

  it('should have accessible social link labels', () => {
    render(<Footer />)

    const githubLink = screen.getByLabelText('GitHub')
    const linkedinLink = screen.getByLabelText('LinkedIn')

    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
  })
})
