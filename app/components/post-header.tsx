import { Avatar } from "./avatar"
import { DateFormatter } from "./date"
import { CoverImage } from "./cover-image"
import { PostTitle } from "./post-title"

interface Author {
  name: string
  picture: string
}

interface PostHeaderProps {
  title: string
  coverImage: string
  date: string
  author: Author
}

export function PostHeader({ title, coverImage, date, author }: PostHeaderProps) {
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
        <div className="mb-6 text-lg">
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  )
}
