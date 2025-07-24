import { Avatar } from "./avatar"
import { DateFormatter } from "./date"
import { CoverImage } from "./cover-image"
import { PostTitle } from "./post-title"
import { PostBody } from "./post-body"
import { PostFooter } from "./post-footer"

interface Author {
  name: string
  picture: string
}

interface PostProps {
  title: string
  coverImage: string
  date: string
  author: Author
  content: string
}

export function Post({ title, coverImage, date, author, content }: PostProps) {
  return (
    <article className="mb-32">
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
      <PostBody content={content} />
      <PostFooter />
    </article>
  )
}
