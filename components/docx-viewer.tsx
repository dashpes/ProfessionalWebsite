'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocxViewerProps {
  url: string
  fileName?: string
  className?: string
}

export function DocxViewer({ url, fileName = 'document.docx', className = '' }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDocument = async () => {
      if (!containerRef.current) return

      try {
        setLoading(true)
        setError(null)

        // Dynamically import docx-preview (client-side only)
        const docxPreview = await import('docx-preview')

        // Fetch the document
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to load document')
        }

        const blob = await response.blob()

        // Clear any previous content safely
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        // Render the document
        await docxPreview.renderAsync(blob, containerRef.current, undefined, {
          className: 'docx-wrapper',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
          trimXmlDeclaration: true,
          useBase64URL: true,
        })

        setLoading(false)
      } catch (err) {
        console.error('Error loading document:', err)
        setError('Failed to load document. Please try downloading it instead.')
        setLoading(false)
      }
    }

    loadDocument()
  }, [url])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`rounded-lg border bg-white dark:bg-gray-900 ${className}`}>
      {/* Header with download button */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-sm">{fileName}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Document viewer */}
      <div className="relative min-h-[500px] overflow-auto p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-sm text-muted-foreground">Loading document...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Document
            </Button>
          </div>
        )}

        <div
          ref={containerRef}
          className="docx-viewer-container"
        />
      </div>

      {/* Styles for docx-preview */}
      <style jsx global>{`
        .docx-viewer-container .docx-wrapper {
          background: white;
          padding: 20px;
        }

        .docx-viewer-container .docx-wrapper > section.docx {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin-bottom: 20px;
          padding: 40px;
          background: white;
        }

        .dark .docx-viewer-container .docx-wrapper {
          background: #1a1a1a;
        }

        .dark .docx-viewer-container .docx-wrapper > section.docx {
          background: #262626;
          color: #e5e5e5;
        }
      `}</style>
    </div>
  )
}
