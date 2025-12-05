'use client'

import { CategoryInfo } from '@/lib/graph-utils'

interface GraphLegendProps {
  categories: CategoryInfo[]
  showBacklinks?: boolean
}

export function GraphLegend({ categories, showBacklinks = true }: GraphLegendProps) {
  return (
    <div
      className="absolute bottom-4 left-4 p-4"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
    >
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
        Legend
      </h4>

      {/* Node colors by category */}
      {categories.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Categories</div>
          <div className="flex flex-col gap-1.5">
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color || '#8884d8' }}
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#8884d8' }}
              />
              <span className="text-sm text-gray-500">Uncategorized</span>
            </div>
          </div>
        </div>
      )}

      {/* Link types */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Connections</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#82ca9d]" />
            <span className="text-sm text-gray-700">Shared tags</span>
          </div>
          {showBacklinks && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#ff7300]" />
              <span className="text-sm text-gray-700">Backlink</span>
            </div>
          )}
        </div>
      </div>

      {/* Size legend */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-2">Node size</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <div className="w-4 h-4 rounded-full bg-gray-400" />
          </div>
          <span className="text-xs text-gray-500">= more views</span>
        </div>
      </div>
    </div>
  )
}
