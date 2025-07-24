"use client"

// Note: metadata is handled by the parent layout due to client component requirements

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import Footer from "../components/footer"

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
    <div className="bg-black text-white min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-12">Contact Me</h1>
        <p className="text-lg text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Have a question, a project idea, or just want to say hello? Feel free to reach out using the form below. I&apos;ll
          get back to you as soon as possible!
        </p>

        <div className="max-w-lg mx-auto bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-lg">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-lg">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-lg">
                Subject
              </Label>
              <Input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-lg">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-3"
              disabled={status === "Sending..."}
            >
              {status === "Sending..." ? "Sending..." : "Send Message"}
            </Button>
            {status && status !== "Sending..." && (
              <p className={`mt-4 text-center ${status.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                {status}
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
