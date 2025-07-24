import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

export function PostFooter() {
  return (
    <div className="mt-16 mb-16">
      <Separator className="my-8 bg-gray-700" />
      <div className="flex justify-center">
        <Link href="/blog">
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    </div>
  )
}
