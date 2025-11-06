'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered, Link2 } from 'lucide-react'

interface NewsletterEditorProps {
  content: string
  onChange: (html: string) => void
}

export function NewsletterEditor({ content, onChange }: NewsletterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color: #5B2C91; text-decoration: underline;'
        }
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 bg-gray-800 rounded-md'
      }
    }
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 bg-gray-700 border-b border-gray-600">
        <Button
          type="button"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-purple-600' : 'bg-gray-800'}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-purple-600' : 'bg-gray-800'}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-purple-600' : 'bg-gray-800'}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-purple-600' : 'bg-gray-800'}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-purple-600' : 'bg-gray-800'}
        >
          <Link2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
