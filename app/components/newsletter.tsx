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
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Subscribe to My Newsletter</h2>
        <p className="text-lg mb-8">Stay updated with my latest projects and insights.</p>
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
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            Subscribe
          </Button>
        </form>
        {message && <p className="mt-4 text-green-400">{message}</p>}
      </div>
    </section>
  )
}
