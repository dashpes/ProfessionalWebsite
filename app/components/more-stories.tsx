import { PostPreview } from "./post-preview"

interface Author {
  name: string
  picture: string
}

interface Post {
  slug: string
  title: string
  coverImage: string
  date: string
  author: Author
  excerpt: string
}

interface MoreStoriesProps {
  posts: Post[]
}

export function MoreStories({ posts }: MoreStoriesProps) {
  return (
    <section className="mb-12 md:mb-16">
      <h2 className="mb-12 text-3xl md:text-5xl font-bold text-center" style={{color: '#5B2C91'}}>
        More Stories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  )
}
