'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, X, FileText, Loader2 } from 'lucide-react'

interface DocumentUploadProps {
  value?: string
  fileName?: string
  onChange: (url: string, fileName: string) => void
  label?: string
}

export function DocumentUpload({ value, fileName, onChange, label = "Document" }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string } | null>(
    value ? { url: value, name: fileName || 'document.docx' } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type - only .docx
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid .docx file')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/admin/upload-document', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setCurrentFile({ url: result.url, name: result.originalName || file.name })
        onChange(result.url, result.originalName || file.name)
        toast.success('Document uploaded successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload document')
      }
    } catch {
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setCurrentFile(null)
    onChange('', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Current file display */}
      {currentFile && (
        <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <FileText className="w-8 h-8 text-blue-400" />
          <div className="flex-1">
            <p className="font-medium text-sm">{currentFile.name}</p>
            <p className="text-xs text-gray-400">{currentFile.url}</p>
          </div>
          <Button
            size="sm"
            onClick={handleRemove}
            className="bg-red-600 hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload .docx
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <p className="text-xs text-gray-400">
        Only .docx files are supported. Maximum size: 10MB.
      </p>
    </div>
  )
}
