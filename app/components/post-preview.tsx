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
    <div>
      <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="text-lg mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      <Avatar src={author.picture} fallback={author.name} />
    </div>
  )
}
