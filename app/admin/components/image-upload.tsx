'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        onChange(result.url)
        toast.success('Image uploaded successfully!')
        
        // Clean up preview URL and set the final URL
        URL.revokeObjectURL(previewUrl)
        setPreview(result.url)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload image')
        setPreview(value || null)
      }
    } catch {
      toast.error('Failed to upload image')
      setPreview(value || null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleManualUrl = (url: string) => {
    setPreview(url)
    onChange(url)
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={120}
            className="rounded-lg object-cover border border-gray-600"
          />
          <Button
            size="sm"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 w-6 h-6 p-0"
          >
            <X className="w-3 h-3" />
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
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Manual URL Input */}
      <div>
        <Label htmlFor="imageUrl">Or enter image URL</Label>
        <Input
          id="imageUrl"
          value={value || ''}
          onChange={(e) => handleManualUrl(e.target.value)}
          className="bg-gray-800 border-gray-600"
          placeholder="/projects/image.png or https://example.com/image.jpg"
        />
      </div>
    </div>
  )
}