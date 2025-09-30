'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link as LinkIcon,
  ImageIcon
} from 'lucide-react'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-purple-400 hover:text-purple-300 underline'
        }
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4'
      }
    }
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-600 p-2 flex flex-wrap gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Type className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={addImage}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="text-white" />
    </div>
  )
}