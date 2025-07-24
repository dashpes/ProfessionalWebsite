import { Avatar } from "./avatar"
import { DateFormatter } from "./date"
import { CoverImage } from "./cover-image"
import Link from "next/link"

interface Author {
  name: string
  picture: string
}

interface HeroPostProps {
  title: string
  coverImage: string
  date: string
  excerpt: string
  author: Author
  slug: string
}

export function HeroPost({ title, coverImage, date, excerpt, author, slug }: HeroPostProps) {
  return (
    <section className="mb-8 md:mb-16">
      <div className="mb-8 md:mb-16">
        <CoverImage title={title} src={coverImage} slug={slug} />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 className="mb-4 text-4xl lg:text-6xl leading-tight">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
          <Avatar src={author.picture} fallback={author.name} />
        </div>
      </div>
    </section>
  )
}
