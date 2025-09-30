import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { generateMetadata, generatePersonSchema, generateWebsiteSchema, SEO_CONSTANTS, PROFESSIONAL_KEYWORDS } from "@/lib/seo"
import PlausibleProvider from "next-plausible"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = generateMetadata({
  title: `${SEO_CONSTANTS.AUTHOR.name} - ${SEO_CONSTANTS.AUTHOR.jobTitle} | Portfolio`,
  description: `${SEO_CONSTANTS.AUTHOR.name} is a ${SEO_CONSTANTS.AUTHOR.jobTitle} and Data Scientist based in ${SEO_CONSTANTS.AUTHOR.location}. Specializing in ${PROFESSIONAL_KEYWORDS.slice(0, 5).join(', ')} with expertise in React, Next.js, Python, and data analysis.`,
  path: ''
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const personSchema = generatePersonSchema()
  const websiteSchema = generateWebsiteSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/android-chrome-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/android-chrome-512x512.svg" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <PlausibleProvider domain="danielashpes.com">
        <body className={inter.className}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </PlausibleProvider>
    </html>
  )
}
