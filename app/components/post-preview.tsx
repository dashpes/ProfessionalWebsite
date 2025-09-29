import { Avatar } from "./avatar"
import { DateFormatter } from "./date"
import { CoverImage } from "./cover-image"
import Link from "next/link"

interface Author {
  name: string
  picture: string
}

interface PostPreviewProps {
  title: string
  coverImage: string
  date: string
  excerpt: string
  author: Author
  slug: string
}

export function PostPreview({ title, coverImage, date, excerpt, author, slug }: PostPreviewProps) {
  return (
    <div
      className="rounded-3xl overflow-hidden transition-all duration-700 ease-out hover:transform hover:-translate-y-1"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
      }}
    >
      <div className="overflow-hidden">
        <CoverImage slug={slug} title={title} src={coverImage} className="rounded-none" />
      </div>
      <div className="p-6">
        <h3 className="text-2xl md:text-3xl mb-3 leading-snug font-bold">
          <Link href={`/posts/${slug}`} className="hover:text-purple-600 transition-colors" style={{color: '#2A2A2A'}}>
            {title}
          </Link>
        </h3>
        <div className="text-lg mb-4" style={{color: '#6B6B6B'}}>
          <DateFormatter dateString={date} />
        </div>
        <p className="text-lg leading-relaxed mb-4" style={{color: '#2A2A2A'}}>{excerpt}</p>
        <Avatar src={author.picture} fallback={author.name} />
      </div>
    </div>
  )
}
