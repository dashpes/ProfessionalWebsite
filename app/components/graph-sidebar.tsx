'use client'

import Link from 'next/link'
import { X, Eye, Calendar, Tag, ArrowRight, Link as LinkIcon } from 'lucide-react'
import { GraphNode, GraphLink } from '@/lib/graph-utils'

interface GraphSidebarProps {
  node: GraphNode | null
  links: GraphLink[]
  allNodes: GraphNode[]
  onClose: () => void
  onNodeSelect: (nodeId: string) => void
}

export function GraphSidebar({
  node,
  links,
  allNodes,
  onClose,
  onNodeSelect
}: GraphSidebarProps) {
  if (!node) return null

  // Find connected nodes
  const connectedNodeIds = new Set<string>()
  const connectionsByType: { tag: GraphLink[]; backlink: GraphLink[] } = { tag: [], backlink: [] }

  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    if (sourceId === node.id) {
      connectedNodeIds.add(targetId)
      connectionsByType[link.type].push(link)
    } else if (targetId === node.id) {
      connectedNodeIds.add(sourceId)
      connectionsByType[link.type].push(link)
    }
  })

  const connectedNodes = allNodes.filter(n => connectedNodeIds.has(n.id))

  const formattedDate = node.publishedAt
    ? new Date(node.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  return (
    <div
      className="absolute top-4 right-4 bottom-4 w-80 overflow-hidden animate-in slide-in-from-right duration-200"
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-start justify-between">
        <div className="flex-1 pr-4">
          {node.categoryName && (
            <div
              className="inline-block px-2 py-0.5 text-xs font-medium text-white rounded-full mb-2"
              style={{ backgroundColor: node.categoryColor || '#8884d8' }}
            >
              {node.categoryName}
            </div>
          )}
          <h2 className="font-bold text-lg text-gray-900 leading-tight">
            {node.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 140px)' }}>
        {/* Excerpt */}
        {node.excerpt && (
          <p className="text-sm text-gray-600 mb-4">
            {node.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{node.viewCount} views</span>
          </div>
        </div>

        {/* Tags */}
        {node.tagNames.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {node.tagNames.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connected Posts */}
        {connectedNodes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connected Posts ({connectedNodes.length})
              </span>
            </div>
            <div className="space-y-2">
              {connectedNodes.map(connectedNode => {
                // Find the link type
                const link = links.find(l => {
                  const sourceId = typeof l.source === 'string' ? l.source : l.source.id
                  const targetId = typeof l.target === 'string' ? l.target : l.target.id
                  return (sourceId === node.id && targetId === connectedNode.id) ||
                         (targetId === node.id && sourceId === connectedNode.id)
                })

                return (
                  <button
                    key={connectedNode.id}
                    onClick={() => onNodeSelect(connectedNode.id)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {connectedNode.title}
                        </div>
                        {link && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: link.type === 'backlink' ? '#ff7300' : '#82ca9d'
                              }}
                            />
                            <span className="text-xs text-gray-500">
                              {link.type === 'backlink'
                                ? 'Backlink'
                                : `${link.strength} shared tag${link.strength > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white rounded-b-[20px]">
        <Link
          href={`/posts/${node.slug}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
        >
          Read Post
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
