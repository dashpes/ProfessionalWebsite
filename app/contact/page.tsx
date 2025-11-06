"use client"

// Note: metadata is handled by the parent layout due to client component requirements

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("Sending...")

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus("Message sent successfully!")
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setStatus(result.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setStatus("Failed to send message. Please try again.")
    }
  }

  return (
    <div className="flex flex-col">
      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* Section Header - Following design system pattern */}
        <h1
          className="text-3xl md:text-5xl font-bold text-center mb-12"
          style={{ color: '#5B2C91' }}
        >
          Get in Touch
        </h1>

        {/* Description Paragraph - Following design system pattern */}
        <p
          className="text-lg leading-relaxed text-center mb-12 max-w-3xl mx-auto"
          style={{ color: '#2A2A2A' }}
        >
          Have a question, a project idea, or just want to say hello? Feel free to reach out using the form below. I&apos;ll
          get back to you as soon as possible!
        </p>

        {/* Glass Form Container - Following design system glassmorphism pattern */}
        <div
          className="max-w-lg mx-auto p-8 rounded-3xl transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="name"
                className="text-lg font-medium mb-2 block"
                style={{ color: '#2A2A2A' }}
              >
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-0 text-base transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#2A2A2A',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="Your name"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-lg font-medium mb-2 block"
                style={{ color: '#2A2A2A' }}
              >
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border-0 text-base transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#2A2A2A',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label
                htmlFor="subject"
                className="text-lg font-medium mb-2 block"
                style={{ color: '#2A2A2A' }}
              >
                Subject
              </Label>
              <Input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full border-0 text-base transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#2A2A2A',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="What's this about?"
              />
            </div>

            <div>
              <Label
                htmlFor="message"
                className="text-lg font-medium mb-2 block"
                style={{ color: '#2A2A2A' }}
              >
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
                className="w-full border-0 text-base transition-all duration-200 resize-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#2A2A2A',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="Tell me about your project or question..."
              />
            </div>

            {/* Button following design system pattern - outline style */}
            <Button
              type="submit"
              size="lg"
              variant="outline"
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300"
              disabled={status === "Sending..."}
            >
              {status === "Sending..." ? "Sending..." : "Send Message"}
            </Button>

            {/* Status message with improved styling */}
            {status && status !== "Sending..." && (
              <div
                className="mt-4 p-4 rounded-lg text-center font-medium"
                style={{
                  background: status.includes("successfully")
                    ? 'rgba(61, 124, 91, 0.1)'
                    : 'rgba(139, 58, 58, 0.1)',
                  border: `1px solid ${status.includes("successfully") ? '#3D7C5B' : '#8B3A3A'}`,
                  color: status.includes("successfully") ? '#3D7C5B' : '#8B3A3A'
                }}
              >
                {status}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
