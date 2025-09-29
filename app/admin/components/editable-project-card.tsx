'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Edit, Save, X, Trash2, ExternalLink, Github } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

interface EditableProjectCardProps {
  project: any
  isManual: boolean
  onUpdate: () => void
  onDelete: (projectId: string, isManual: boolean) => void
}

export function EditableProjectCard({
  project,
  isManual,
  onUpdate,
  onDelete
}: EditableProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: project.title,
    description: project.description,
    technologies: project.technologies,
    featured: project.featured,
    order: project.order,
    image: project.image,
    github: project.github,
    live: project.live
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        toast.success('Project updated successfully!')
        setIsEditing(false)
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update project')
      }
    } catch {
      toast.error('Failed to update project')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to ${isManual ? 'delete' : 'clear overrides for'} this project?`)) {
      return
    }

    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success(isManual ? 'Project deleted successfully!' : 'Project overrides cleared!')
        onDelete(project.id, isManual)
      } else {
        toast.error('Failed to delete project')
      }
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const handleCancel = () => {
    setEditData({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      featured: project.featured,
      order: project.order,
      image: project.image,
      github: project.github,
      live: project.live
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor={`title-${project.id}`}>Title</Label>
            <Input
              id={`title-${project.id}`}
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="bg-gray-900 border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor={`desc-${project.id}`}>Description</Label>
            <Textarea
              id={`desc-${project.id}`}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="bg-gray-900 border-gray-600"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor={`tech-${project.id}`}>Technologies (comma-separated)</Label>
            <Input
              id={`tech-${project.id}`}
              value={editData.technologies.join(', ')}
              onChange={(e) => setEditData({
                ...editData,
                technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="bg-gray-900 border-gray-600"
              placeholder="React, TypeScript, Node.js"
            />
          </div>

          <ImageUpload
            value={editData.image || ''}
            onChange={(url) => setEditData({ ...editData, image: url })}
            label="Project Image"
          />

          {isManual && (
            <>
              <div>
                <Label htmlFor={`github-${project.id}`}>GitHub URL</Label>
                <Input
                  id={`github-${project.id}`}
                  value={editData.github || ''}
                  onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                  className="bg-gray-900 border-gray-600"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <Label htmlFor={`live-${project.id}`}>Live Demo URL</Label>
                <Input
                  id={`live-${project.id}`}
                  value={editData.live || ''}
                  onChange={(e) => setEditData({ ...editData, live: e.target.value })}
                  className="bg-gray-900 border-gray-600"
                  placeholder="https://project-demo.com"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id={`featured-${project.id}`}
                checked={editData.featured || false}
                onCheckedChange={(checked) => setEditData({ ...editData, featured: checked })}
              />
              <Label htmlFor={`featured-${project.id}`}>Featured</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor={`order-${project.id}`}>Order</Label>
              <Input
                id={`order-${project.id}`}
                type="number"
                value={editData.order || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  order: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="bg-gray-900 border-gray-600 w-20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} variant="outline" className="border-gray-600">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">{project.title}</h3>
          {project.featured && <Badge className="bg-purple-600">Featured</Badge>}
          <Badge variant="outline" className={isManual ? "border-blue-500 text-blue-400" : "border-green-500 text-green-400"}>
            {isManual ? 'Manual' : 'GitHub'}
          </Badge>
          {!isManual && project.hasOverrides && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              Modified
            </Badge>
          )}
          {project.order && (
            <Badge variant="outline" className="border-gray-500 text-gray-400">
              Order: {project.order}
            </Badge>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-2">{project.description}</p>

        <div className="flex gap-2 mb-2">
          {project.technologies.map((tech: string, i: number) => (
            <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">{tech}</span>
          ))}
        </div>

        {(project.github || project.live) && (
          <div className="flex gap-3 text-xs">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white"
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-3 h-3" />
                Live Demo
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}