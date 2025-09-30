'use client'

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeftIcon, Share2 } from "lucide-react"

interface PostFooterProps {
  slug?: string
  title?: string
}

export function PostFooter({ slug, title }: PostFooterProps) {
  const handleShare = async () => {
    if (typeof window === 'undefined') return

    const shareUrl = `${window.location.origin}/posts/${slug}`
    const shareText = `Check out this post: ${title}`

    if (navigator.share && slug && title) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl
        })
      } catch {
        // Fallback to copying to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl)
          alert('Link copied to clipboard!')
        }
      }
    } else if (navigator.clipboard && shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  return (
    <div className="mt-16 mb-16">
      <Separator className="my-8 bg-gray-700" />
      <div className="flex justify-center gap-4">
        <Link href="/blog">
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
        {slug && title && (
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white bg-transparent"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        )}
      </div>
    </div>
  )
}
