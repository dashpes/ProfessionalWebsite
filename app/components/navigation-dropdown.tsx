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
            className="h-12 w-12 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="mt-2"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(91, 44, 145, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          }}
        >
          <DropdownMenuItem asChild>
            <Link
              href="/"
              className="text-[#5B2C91] hover:bg-purple-100/50 hover:text-[#3D1D61] transition-colors font-medium"
            >
              Home
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/about"
              className="text-[#5B2C91] hover:bg-purple-100/50 hover:text-[#3D1D61] transition-colors font-medium"
            >
              About
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/projects"
              className="text-[#5B2C91] hover:bg-purple-100/50 hover:text-[#3D1D61] transition-colors font-medium"
            >
              Projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/blog"
              className="text-[#5B2C91] hover:bg-purple-100/50 hover:text-[#3D1D61] transition-colors font-medium"
            >
              Blog
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/contact"
              className="text-[#5B2C91] hover:bg-purple-100/50 hover:text-[#3D1D61] transition-colors font-medium"
            >
              Contact
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
