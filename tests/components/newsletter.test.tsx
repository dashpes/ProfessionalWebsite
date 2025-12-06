import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, type, ...props }: { children: React.ReactNode; type?: string }) => (
    <button type={type as 'submit' | 'button'} data-testid="submit-button" {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="email-input" {...props} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: { children: React.ReactNode }) => (
    <label {...props}>{children}</label>
  ),
}))

import { Newsletter } from '@/app/components/newsletter'

describe('Newsletter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should render the newsletter form', () => {
    render(<Newsletter />)

    expect(screen.getByText('Subscribe to My Newsletter')).toBeInTheDocument()
    expect(screen.getByText(/Stay updated with my latest blog posts/)).toBeInTheDocument()
  })

  it('should render email input', () => {
    render(<Newsletter />)
    const input = screen.getByTestId('email-input')

    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter your email')
    expect(input).toHaveAttribute('required')
  })

  it('should render subscribe button', () => {
    render(<Newsletter />)
    const button = screen.getByTestId('submit-button')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Subscribe')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should update email value on input change', async () => {
    render(<Newsletter />)
    const input = screen.getByTestId('email-input')

    await userEvent.type(input, 'test@example.com')

    expect(input).toHaveValue('test@example.com')
  })

  it('should show success message on form submit', async () => {
    render(<Newsletter />)
    const input = screen.getByTestId('email-input')
    const button = screen.getByTestId('submit-button')

    await userEvent.type(input, 'test@example.com')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Thank you for signing up!')).toBeInTheDocument()
    })
  })

  it('should clear email input after successful submit', async () => {
    render(<Newsletter />)
    const input = screen.getByTestId('email-input')
    const button = screen.getByTestId('submit-button')

    await userEvent.type(input, 'test@example.com')
    fireEvent.click(button)

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should log email to console on submit', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    render(<Newsletter />)
    const input = screen.getByTestId('email-input')
    const button = screen.getByTestId('submit-button')

    await userEvent.type(input, 'newsletter@test.com')
    fireEvent.click(button)

    expect(consoleSpy).toHaveBeenCalledWith('Newsletter signup:', 'newsletter@test.com')
  })

  it('should have accessible label for email input', () => {
    render(<Newsletter />)
    const label = screen.getByText('Email')

    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('sr-only')
  })
})
