import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  className?: string
}

export function UserAvatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src || "/placeholder.png"} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

// Export as Avatar for compatibility with existing imports
export { UserAvatar as Avatar }
export default UserAvatar
