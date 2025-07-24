"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PasswordGateProps {
  onPasswordCorrect: () => void
}

export default function PasswordGate({ onPasswordCorrect }: PasswordGateProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Move password to environment variable for security
    const correctPassword = process.env.NEXT_PUBLIC_SITE_PASSWORD || "demo123"
    if (password === correctPassword) {
      onPasswordCorrect()
    } else {
      setError("Incorrect password")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-2">Site Access</h1>
        <p className="text-gray-300 text-center mb-8">Enter password to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="password" className="text-lg">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-center">{error}</p>
          )}
          
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-3"
          >
            Enter Site
          </Button>
        </form>
      </div>
    </div>
  )
}