import Image from "next/image"
import Link from "next/link"

interface CoverImageProps {
  title: string
  src: string
  slug?: string
  className?: string
}

export function CoverImage({ title, src, slug, className }: CoverImageProps) {
  const image = (
    <Image
      src={src || "/placeholder.png"}
      alt={`Cover Image for ${title}`}
      className={`w-full object-cover ${slug ? "hover:shadow-lg transition-shadow duration-200" : ""} ${className}`}
      width={1300}
      height={630}
    />
  )
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}
