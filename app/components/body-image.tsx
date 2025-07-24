import Image from "next/image"

interface BodyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function BodyImage({ src, alt, width = 760, height = 420, className }: BodyImageProps) {
  return (
    <div className={`relative w-full h-[${height}px] overflow-hidden rounded-lg ${className}`}>
      <Image
        src={src || "/placeholder.png"}
        alt={alt}
        width={width}
        height={height}
        className="object-cover w-full h-full"
      />
    </div>
  )
}
