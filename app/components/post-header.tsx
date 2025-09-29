import { Avatar } from "./avatar"
import { DateFormatter } from "./date"
import { CoverImage } from "./cover-image"
import { PostTitle } from "./post-title"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye } from "lucide-react"

interface Author {
  name: string
  picture: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface PostHeaderProps {
  title: string
  coverImage: string
  date: string
  author: Author
  readingTime?: number
  viewCount?: number
  categories?: Category[]
  tags?: Tag[]
}

export function PostHeader({
  title,
  coverImage,
  date,
  author,
  readingTime,
  viewCount,
  categories = [],
  tags = []
}: PostHeaderProps) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:block md:mb-12">
        <Avatar src={author.picture} fallback={author.name} />
      </div>
      <div className="mb-8 md:mb-16 sm:mx-0">
        <CoverImage title={title} src={coverImage} />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          <Avatar src={author.picture} fallback={author.name} />
        </div>
        <div className="mb-6 text-lg flex items-center gap-4 flex-wrap">
          <DateFormatter dateString={date} />
          {readingTime && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </div>
          )}
          {viewCount !== undefined && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Eye className="w-4 h-4" />
              {viewCount} views
            </div>
          )}
        </div>

        {(categories.length > 0 || tags.length > 0) && (
          <div className="mb-6">
            {categories.length > 0 && (
              <div className="mb-3">
                <span className="text-sm text-gray-400 mr-2">Categories:</span>
                <div className="inline-flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="outline" className="border-blue-500 text-blue-400">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <span className="text-sm text-gray-400 mr-2">Tags:</span>
                <div className="inline-flex gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="border-green-500 text-green-400">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
