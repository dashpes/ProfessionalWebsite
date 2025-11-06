"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import NavigationDropdown from "./components/navigation-dropdown"
import PasswordGate from "./components/password-gate"
import { Toaster } from "@/components/ui/sonner"
import GlobalWavesBackground from "@/components/global-waves-background"
import Footer from "./components/footer"
import { useState, useEffect } from "react"


export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Password gate disabled for production
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Changed to true to bypass password

  useEffect(() => {
    const authenticated = sessionStorage.getItem("authenticated")
    if (authenticated === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordCorrect = () => {
    sessionStorage.setItem("authenticated", "true")
    setIsAuthenticated(true)
  }

  // Temporarily disable password gate - can be re-enabled by changing isAuthenticated to false above
  if (!isAuthenticated && false) { // Added "&& false" to disable
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <PasswordGate onPasswordCorrect={handlePasswordCorrect} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="relative min-h-screen bg-background text-foreground">
        {/* Global waves background for all pages */}
        <GlobalWavesBackground />

        {/* Content */}
        <div className="relative z-10">
          <NavigationDropdown />
          {children}
          <Footer />
          <Toaster />
        </div>
      </div>
    </ThemeProvider>
  )
}