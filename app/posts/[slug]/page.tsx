import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata, generateBlogPostSchema, SEO_CONSTANTS } from '@/lib/seo'
import { PostHeader } from "../../components/post-header"
import { PostBody } from "../../components/post-body"
import { PostFooter } from "../../components/post-footer"
import { Newsletter } from "../../components/newsletter"
import Footer from "../../components/footer"

// Placeholder data for a single blog post
const DUMMY_POST_CONTENT = `
# This is a Sample Blog Post Title

This is the **introduction** to my sample blog post. It's designed to give you an idea of how content will be displayed.

## Section 1: The Power of Next.js

Next.js is a powerful React framework that enables you to build highly performant and scalable web applications. It offers features like server-side rendering (SSR), static site generation (SSG), and API routes, making it incredibly versatile for various projects.

\`\`\`javascript
// Example of a simple Next.js API route
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
\`\`\`

### Sub-section: Static Site Generation

Static Site Generation (SSG) is a build-time rendering approach where HTML is generated at build time and reused on each request. This is great for content-heavy sites like blogs, as it provides excellent performance and SEO benefits.

## Section 2: Data Analysis with Python

As a Data Analyst, I often use Python for data manipulation and analysis. Libraries like Pandas and NumPy are indispensable tools in my workflow.

\`\`\`python
import pandas as pd

data = {'Name': ['Alice', 'Bob', 'Charlie'],
        'Age': [25, 30, 35],
        'City': ['New York', 'London', 'Paris']}
df = pd.DataFrame(data)
print(df)
\`\`\`

This table shows some sample data:

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |

## Conclusion

I hope this sample post gives you a good overview of the content you can expect on my blog. Stay tuned for more insights into full-stack development, data analysis, and technology!
`

const DUMMY_POST_METADATA = {
  title: "This is a Sample Blog Post Title",
  coverImage: "/placeholder.png?height=630&width=1300",
  date: "2023-04-05T05:35:07.322Z",
  author: {
    name: "Daniel Ashpes",
    picture: "/placeholder-user.png",
  },
  content: DUMMY_POST_CONTENT,
  slug: "sample-blog-post"
}

// Generate metadata for the blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // In a real app, you'd fetch the post data based on params.slug
  const post = DUMMY_POST_METADATA
  
  return generateSEOMetadata({
    title: `${post.title} - ${SEO_CONSTANTS.AUTHOR.name} Blog`,
    description: `${post.content.substring(0, 160)}...`,
    path: `/posts/${params.slug}`,
    image: post.coverImage,
    type: 'article'
  })
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = DUMMY_POST_METADATA // In a real app, you'd fetch this based on the slug

  if (!post) {
    return <div>Post not found</div> // Or a proper 404 page
  }

  const blogPostSchema = generateBlogPostSchema({
    title: post.title,
    description: `${post.content.substring(0, 160)}...`,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SEO_CONSTANTS.SITE_URL}/posts/${params.slug}`,
    image: post.coverImage
  })

  return (
    <div className="bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema),
        }}
      />
      <div className="container mx-auto px-5">
        <PostHeader title={post.title} coverImage={post.coverImage} date={post.date} author={post.author} />
        <PostBody content={post.content} />
        <PostFooter />
      </div>
      <Newsletter />
      <Footer />
    </div>
  )
}
