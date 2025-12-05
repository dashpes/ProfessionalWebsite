"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const STORAGE_KEY = 'newsletter-dismissed'
const DELAY_MS = 8000 // 8 seconds

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed or subscribed
    const isDismissed = localStorage.getItem(STORAGE_KEY)

    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, DELAY_MS)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Successfully subscribed! Check your inbox for updates.')
        localStorage.setItem(STORAGE_KEY, 'true')
        setIsOpen(false)
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 sm:mx-0 animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl shadow-2xl border border-purple-600/50 p-8 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-3">
              Stay Updated
            </h2>
            <p className="text-purple-100">
              Subscribe to get notified about new blog posts and technical insights.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-purple-400/50 text-white placeholder:text-purple-200/60 focus:border-purple-300"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="w-full bg-white text-purple-900 hover:bg-purple-50 font-semibold transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>

          {/* Fine print */}
          <p className="text-xs text-purple-200/70 text-center mt-4">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </>
  )
}
