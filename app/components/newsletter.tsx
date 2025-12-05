"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would send this email to your backend
    console.log("Newsletter signup:", email)
    setMessage("Thank you for signing up!")
    setEmail("")
  }

  return (
    <section className="py-16 md:py-24" style={{background: 'rgba(91, 44, 145, 0.05)'}}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6" style={{color: '#5B2C91'}}>
          Subscribe to My Newsletter
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{color: '#2A2A2A'}}>
          Stay updated with my latest blog posts, projects, and technical insights.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
          <Label htmlFor="email-newsletter" className="sr-only">
            Email
          </Label>
          <Input
            id="email-newsletter"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border-purple-600"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '12px',
              color: '#2A2A2A'
            }}
          />
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 min-w-[160px]"
          >
            Subscribe
          </Button>
        </form>
        {message && <p className="mt-4" style={{color: '#3D7C5B'}}>{message}</p>}
      </div>
    </section>
  )
}
