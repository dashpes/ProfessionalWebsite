'use client'

import { GraphNode } from '@/lib/graph-utils'
import { Eye, Calendar, Tag } from 'lucide-react'

interface GraphNodeTooltipProps {
  node: GraphNode | null
  position: { x: number; y: number } | null
}

export function GraphNodeTooltip({ node, position }: GraphNodeTooltipProps) {
  if (!node || !position) return null

  const formattedDate = node.publishedAt
    ? new Date(node.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y - 10,
        maxWidth: '300px'
      }}
    >
      <div
        className="p-4 animate-in fade-in zoom-in-95 duration-150"
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Category badge */}
        {node.categoryName && (
          <div
            className="inline-block px-2 py-0.5 text-xs font-medium text-white rounded-full mb-2"
            style={{ backgroundColor: node.categoryColor || '#8884d8' }}
          >
            {node.categoryName}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
          {node.title}
        </h3>

        {/* Excerpt */}
        {node.excerpt && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {node.excerpt}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{node.viewCount} views</span>
          </div>
        </div>

        {/* Tags */}
        {node.tagNames.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <Tag className="w-3 h-3 text-gray-400" />
            {node.tagNames.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {node.tagNames.length > 5 && (
              <span className="text-xs text-gray-400">
                +{node.tagNames.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Click hint */}
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          Click to read post
        </div>
      </div>
    </div>
  )
}
