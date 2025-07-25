'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Project, ProjectConfig } from '@/lib/types'
import { Trash2, Edit, Plus, Save, LogOut } from 'lucide-react'
import { ImageUpload } from '../components/image-upload'
import GitHubSync from '../components/github-sync'


export default function AdminDashboard() {
  const [config, setConfig] = useState<ProjectConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const fetchConfig = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/admin/projects', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Admin dashboard received config:', data)
        console.log('RepoOverrides keys:', Object.keys(data.repoOverrides || {}))
        setConfig(data)
      } else {
        toast.error('Failed to load configuration')
        router.push('/admin')
      }
    } catch {
      toast.error('Failed to load configuration')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.push('/admin')
      return
    }

    fetchConfig()
  }, [router, fetchConfig])

  const saveConfig = async () => {
    if (!config) return
    
    setIsSaving(true)
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success('Configuration saved successfully!')
      } else {
        toast.error('Failed to save configuration')
      }
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    router.push('/admin')
  }

  const openProjectDialog = (project?: Partial<Project>) => {
    setEditingProject(project || {
      id: '',
      title: '',
      description: '',
      technologies: [],
      featured: false,
      manual: true
    })
    setIsDialogOpen(true)
  }

  const saveProject = () => {
    if (!editingProject || !config) return

    const updatedConfig = { ...config }
    
    if (editingProject.manual) {
      // Handle manual projects
      const existingIndex = updatedConfig.manualProjects.findIndex(p => p.id === editingProject.id)
      
      if (existingIndex >= 0) {
        updatedConfig.manualProjects[existingIndex] = editingProject as Project
      } else {
        editingProject.id = editingProject.id || Date.now().toString()
        updatedConfig.manualProjects.push(editingProject as Project)
      }
    } else {
      // Handle GitHub repo overrides
      if (editingProject.id) {
        updatedConfig.repoOverrides = updatedConfig.repoOverrides || {}
        updatedConfig.repoOverrides[editingProject.id] = editingProject
      }
    }

    setConfig(updatedConfig)
    setIsDialogOpen(false)
    setEditingProject(null)
  }

  const deleteProject = (projectId: string, isManual: boolean) => {
    if (!config) return

    const updatedConfig = { ...config }
    
    if (isManual) {
      updatedConfig.manualProjects = updatedConfig.manualProjects.filter(p => p.id !== projectId)
    } else {
      delete updatedConfig.repoOverrides?.[projectId]
    }

    setConfig(updatedConfig)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Failed to load configuration</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Project Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button onClick={saveConfig} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-gray-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="github">GitHub Sync</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* Manual Projects */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Manual Projects</CardTitle>
                  <Button onClick={() => openProjectDialog()} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.manualProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          {project.featured && <Badge className="bg-purple-600">Featured</Badge>}
                          <Badge variant="outline" className="border-blue-500 text-blue-400">Manual</Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                        <div className="flex gap-2 mt-2">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">{tech}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openProjectDialog(project)} className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => deleteProject(project.id, true)} className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {config.manualProjects.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No manual projects added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GitHub Repo Overrides */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>GitHub Repository Overrides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(config.repoOverrides || {}).map(([repoName, override]) => (
                    <div key={repoName} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{override.title || repoName}</h3>
                          {override.featured && <Badge className="bg-purple-600">Featured</Badge>}
                          <Badge variant="outline" className="border-green-500 text-green-400">GitHub</Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{override.description}</p>
                        {override.technologies && (
                          <div className="flex gap-2 mt-2">
                            {override.technologies.map((tech, i) => (
                              <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openProjectDialog({ ...override, id: repoName })} className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => deleteProject(repoName, false)} className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {Object.keys(config.repoOverrides || {}).length === 0 && (
                    <p className="text-gray-400 text-center py-8">No GitHub repository overrides configured.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="github" className="space-y-6">
            <GitHubSync />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>GitHub Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="githubUsername">GitHub Username</Label>
                  <Input
                    id="githubUsername"
                    value={config.githubUsername}
                    onChange={(e) => setConfig({ ...config, githubUsername: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="excludeRepos">Excluded Repositories (comma-separated)</Label>
                  <Input
                    id="excludeRepos"
                    value={config.excludeRepos?.join(', ') || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      excludeRepos: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="repo1, repo2, repo3"
                  />
                </div>

                <div>
                  <Label htmlFor="includeRepos">Include Only These Repositories (comma-separated, leave empty to include all)</Label>
                  <Input
                    id="includeRepos"
                    value={config.includeRepos?.join(', ') || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      includeRepos: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="repo1, repo2, repo3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject?.id ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
            </DialogHeader>
            {editingProject && (
              <div className="space-y-4">
                {editingProject.manual && (
                  <div>
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input
                      id="projectId"
                      value={editingProject.id || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="unique-project-id"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="projectTitle">Title</Label>
                  <Input
                    id="projectTitle"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="bg-gray-800 border-gray-600"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="projectTechnologies">Technologies (comma-separated)</Label>
                  <Input
                    id="projectTechnologies"
                    value={editingProject.technologies?.join(', ') || ''}
                    onChange={(e) => setEditingProject({ 
                      ...editingProject, 
                      technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>

                <ImageUpload
                  value={editingProject.image || ''}
                  onChange={(url) => setEditingProject({ ...editingProject, image: url })}
                  label="Project Image"
                />

                {editingProject.manual && (
                  <>
                    <div>
                      <Label htmlFor="projectGithub">GitHub URL</Label>
                      <Input
                        id="projectGithub"
                        value={editingProject.github || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                        className="bg-gray-800 border-gray-600"
                        placeholder="https://github.com/username/repo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectLive">Live Demo URL</Label>
                      <Input
                        id="projectLive"
                        value={editingProject.live || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, live: e.target.value })}
                        className="bg-gray-800 border-gray-600"
                        placeholder="https://project-demo.com"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="projectFeatured"
                    checked={editingProject.featured || false}
                    onCheckedChange={(checked) => setEditingProject({ ...editingProject, featured: checked })}
                  />
                  <Label htmlFor="projectFeatured">Featured Project</Label>
                </div>

                <div>
                  <Label htmlFor="projectOrder">Display Order (optional)</Label>
                  <Input
                    id="projectOrder"
                    type="number"
                    value={editingProject.order || ''}
                    onChange={(e) => setEditingProject({ 
                      ...editingProject, 
                      order: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="bg-gray-800 border-gray-600"
                    placeholder="1"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="border-gray-600">
                    Cancel
                  </Button>
                  <Button onClick={saveProject} className="bg-purple-600 hover:bg-purple-700">
                    Save Project
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}