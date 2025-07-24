"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon } from "./icons/check-icon"
import { ClipboardIcon } from "./icons/clipboard-icon"

interface CopyToClipboardProps {
  text: string
  className?: string
}

export function CopyToClipboard({ text, className }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Button onClick={handleCopy} className={`flex items-center gap-2 ${className}`} variant="outline" size="sm">
      {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  )
}
