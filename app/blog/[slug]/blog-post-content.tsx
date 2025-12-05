'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import 'highlight.js/styles/vs2015.css'

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string
  readingTimeMinutes: number | null
  category: { name: string; color: string } | null
  tags: { id: string; name: string }[]
}

interface BlogPostContentProps {
  post: BlogPost
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  // Apply syntax highlighting when content loads
  useEffect(() => {
    const applyHighlighting = async () => {
      const hljs = (await import('highlight.js')).default
      document.querySelectorAll('.blog-content pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement)
      })
    }
    setTimeout(applyHighlighting, 100)
  }, [post])

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span>Back to Blog</span>
        </Link>

        <article>
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: post.category.color }}
              >
                {post.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            {post.readingTimeMinutes && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{post.readingTimeMinutes} min read</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="blog-content max-w-none
              [&_p]:text-white [&_p]:leading-relaxed [&_p]:opacity-90 [&_p]:mb-6
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3
              [&_strong]:text-white [&_strong]:font-semibold
              [&_a]:text-purple-400 [&_a]:no-underline hover:[&_a]:underline
              [&_ul]:my-6 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-6 [&_ol]:pl-6 [&_ol]:list-decimal
              [&_li]:text-white [&_li]:opacity-90 [&_li]:mb-3
              [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:text-gray-100
              [&_pre]:bg-[#1e1e1e] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6
              [&_code]:text-[#d4d4d4] [&_code]:text-sm
              [&_.hljs-keyword]:text-[#569cd6] [&_.hljs-string]:text-[#ce9178]
              [&_.hljs-number]:text-[#b5cea8] [&_.hljs-function]:text-[#dcdcaa]
              [&_.hljs-comment]:text-[#6a9955] [&_.hljs-built_in]:text-[#4ec9b0]
              [&_.hljs-title]:text-[#dcdcaa] [&_.hljs-params]:text-[#9cdcfe]
              [&_.hljs-attr]:text-[#9cdcfe] [&_.hljs-variable]:text-[#9cdcfe]
              [&_img]:rounded-lg [&_img]:my-6"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  )
}
