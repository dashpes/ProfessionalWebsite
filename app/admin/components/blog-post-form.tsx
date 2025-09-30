'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { RichTextEditor } from './rich-text-editor'
import { ImageUpload } from './image-upload'
import { X } from 'lucide-react'

interface BlogPost {
  id?: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  categories: string[]
  tags: string[]
  publishedAt?: string
}

interface BlogPostFormProps {
  post?: BlogPost | null
  onSave: (post: BlogPost) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function BlogPostForm({ post, onSave, onCancel, loading = false }: BlogPostFormProps) {
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    status: 'DRAFT',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    categories: [],
    tags: [],
    publishedAt: ''
  })

  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newTag, setNewTag] = useState('')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ''
      })
    }
  }, [post])

  useEffect(() => {
    // Fetch available categories and tags
    Promise.all([
      fetch('/api/blog/categories').then(res => res.json()),
      fetch('/api/blog/tags').then(res => res.json())
    ]).then(([categories, tags]) => {
      setAvailableCategories(categories.map((c: { name: string }) => c.name))
      setAvailableTags(tags.map((t: { name: string }) => t.name))
    }).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Failed to save post:', error)
      toast.error('Failed to save post')
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      })
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    })
  }

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory.trim()]
      })
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(c => c !== category)
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter post title..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-white">Content *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Start writing your blog post..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">SEO & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle" className="text-white">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="SEO title (leave empty to use post title)"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription" className="text-white">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="SEO description (leave empty to use excerpt)"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-white">Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Add keyword..."
                  />
                  <Button type="button" onClick={addKeyword} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="bg-gray-700">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.status === 'PUBLISHED' || formData.status === 'SCHEDULED') && (
                <div>
                  <Label htmlFor="publishedAt" className="text-white">
                    {formData.status === 'PUBLISHED' ? 'Published At' : 'Schedule For'}
                  </Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured" className="text-white">Featured Post</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.coverImage || ''}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                label="Cover Image"
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Add category..."
                  list="categories"
                />
                <datalist id="categories">
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <Button type="button" onClick={addCategory} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="bg-blue-700">
                    {category}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Add tag..."
                  list="tags"
                />
                <datalist id="tags">
                  {availableTags.map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-green-700">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
        <Button type="button" onClick={onCancel} variant="outline" className="border-gray-600">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          {loading ? 'Saving...' : (post?.id ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  )
}