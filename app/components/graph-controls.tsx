'use client'

import { useState } from 'react'
import { Search, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react'
import { TagInfo, CategoryInfo } from '@/lib/graph-utils'

interface GraphControlsProps {
  tags: TagInfo[]
  categories: CategoryInfo[]
  selectedTags: string[]
  selectedCategory: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onTagsChange: (tagIds: string[]) => void
  onCategoryChange: (categoryId: string | null) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
  onClose: () => void
}

export function GraphControls({
  tags,
  categories,
  selectedTags,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onTagsChange,
  onCategoryChange,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onClose
}: GraphControlsProps) {
  const [showFilters, setShowFilters] = useState(false)

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const clearFilters = () => {
    onTagsChange([])
    onCategoryChange(null)
    onSearchChange('')
  }

  const hasFilters = selectedTags.length > 0 || selectedCategory || searchQuery

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div
            className="relative"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Control buttons */}
        <div
          className="flex items-center gap-1 px-2 py-1"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onZoomFit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              showFilters ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            Filters
            {hasFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                {selectedTags.length + (selectedCategory ? 1 : 0)}
              </span>
            )}
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div
          className="p-4 max-w-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      selectedCategory === category.id
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedCategory === category.id ? {
                      backgroundColor: category.color || '#8884d8'
                    } : undefined}
                  >
                    {category.name}
                    <span className="ml-1 text-xs opacity-60">({category.postCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 20).map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                    <span className="ml-1 text-xs opacity-60">({tag.postCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
