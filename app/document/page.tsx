'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DocxViewer } from '@/components/docx-viewer'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

function DocumentContent() {
  const searchParams = useSearchParams()
  const fileUrl = searchParams.get('file')
  const fileName = searchParams.get('name') || 'document.docx'

  if (!fileUrl) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold mb-2">No Document Specified</h1>
          <p className="text-gray-400 mb-6">Please provide a document URL to view.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <h1 className="text-3xl font-bold">{fileName}</h1>
        </div>

        {/* Document Viewer */}
        <DocxViewer url={fileUrl} fileName={fileName} />
      </div>
    </div>
  )
}

export default function DocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p className="text-gray-400">Loading document...</p>
          </div>
        </div>
      }
    >
      <DocumentContent />
    </Suspense>
  )
}
