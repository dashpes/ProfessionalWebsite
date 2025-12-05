"use client"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"

export default function NavigationDropdown() {
  return (
    <div className="fixed top-6 right-6 z-[100]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-white/90 backdrop-blur-sm transition-all duration-300"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-white/15 backdrop-blur-[12px] border-white/30 shadow-lg shadow-[#5B2C91]/15 mt-2"
        >
          <DropdownMenuItem asChild>
            <Link
              href="/"
              className="text-[#2A2A2A] hover:bg-white/20 hover:text-[#5B2C91] transition-colors font-medium"
            >
              Home
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/about"
              className="text-[#2A2A2A] hover:bg-white/20 hover:text-[#5B2C91] transition-colors font-medium"
            >
              About
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/projects"
              className="text-[#2A2A2A] hover:bg-white/20 hover:text-[#5B2C91] transition-colors font-medium"
            >
              Projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/blog"
              className="text-[#2A2A2A] hover:bg-white/20 hover:text-[#5B2C91] transition-colors font-medium"
            >
              Blog
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/contact"
              className="text-[#2A2A2A] hover:bg-white/20 hover:text-[#5B2C91] transition-colors font-medium"
            >
              Contact
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
