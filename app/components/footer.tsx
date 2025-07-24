import Link from "next/link"
import { Github, Linkedin } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Daniel Ashpes. All rights reserved.</p>
          <Link href="/admin" className="text-xs opacity-40 hover:opacity-100 hover:text-white transition-all block mt-1">
            Admin
          </Link>
        </div>
        <div className="flex space-x-6 mb-4 md:mb-0">
          <Link href="https://github.com/dashpes" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/danielashpes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
        </div>
        <nav className="flex space-x-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}

// Export both as named and default for compatibility
export { Footer }
export default Footer
