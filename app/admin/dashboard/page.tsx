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

interface BlogPost {
  id?: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  categories?: { category: { id: string; name: string } }[]
  tags?: { tag: { id: string; name: string } }[]
  publishedAt?: string
  createdAt?: string
  viewCount?: number
  readingTimeMinutes?: number
}
import { Trash2, Edit, Plus, Save, LogOut, Eye } from 'lucide-react'
import { ImageUpload } from '../components/image-upload'
import GitHubSync from '../components/github-sync'
import { BlogPostForm } from '../components/blog-post-form'
import { EditableProjectCard } from '../components/editable-project-card'


export default function AdminDashboard() {
  const [config, setConfig] = useState<ProjectConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [blogLoading, setBlogLoading] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)

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

  // Blog functions
  const fetchBlogPosts = useCallback(async () => {
    setBlogLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/blog/posts?admin=true&page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.posts)
      } else {
        toast.error('Failed to load blog posts')
      }
    } catch {
      toast.error('Failed to load blog posts')
    } finally {
      setBlogLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (token) {
      fetchBlogPosts()
    }
  }, [fetchBlogPosts])

  const saveBlogPost = async (postData: BlogPost) => {
    const token = localStorage.getItem('admin-token')
    const isUpdate = !!editingPost?.id

    try {
      const response = await fetch(
        isUpdate ? `/api/blog/posts/${editingPost.id}` : '/api/blog/posts',
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(postData)
        }
      )

      if (response.ok) {
        toast.success(`Blog post ${isUpdate ? 'updated' : 'created'} successfully!`)
        setIsPostDialogOpen(false)
        setEditingPost(null)
        fetchBlogPosts()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${isUpdate ? 'update' : 'create'} blog post`)
      }
    } catch {
      toast.error(`Failed to ${isUpdate ? 'update' : 'create'} blog post`)
    }
  }

  const deleteBlogPost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    const token = localStorage.getItem('admin-token')
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Blog post deleted successfully!')
        fetchBlogPosts()
      } else {
        toast.error('Failed to delete blog post')
      }
    } catch {
      toast.error('Failed to delete blog post')
    }
  }

  const openPostDialog = (post?: BlogPost) => {
    setEditingPost(post || null)
    setIsPostDialogOpen(true)
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
            <TabsTrigger value="blog">Blog</TabsTrigger>
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
                    <EditableProjectCard
                      key={project.id}
                      project={project}
                      isManual={true}
                      onUpdate={fetchConfig}
                      onDelete={deleteProject}
                    />
                  ))}
                  {config.manualProjects.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No manual projects added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GitHub Projects */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>GitHub Projects</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Edit GitHub-synced projects to override their display information
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.githubProjects?.map((project) => (
                    <EditableProjectCard
                      key={project.id}
                      project={project}
                      isManual={false}
                      onUpdate={fetchConfig}
                      onDelete={deleteProject}
                    />
                  )) || (
                    <p className="text-gray-400 text-center py-8">
                      No GitHub projects synced yet. Go to the GitHub Sync tab to sync your repositories.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Blog Posts</CardTitle>
                  <Button onClick={() => openPostDialog()} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {blogLoading ? (
                  <div className="text-center py-8">Loading blog posts...</div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.featured && <Badge className="bg-purple-600">Featured</Badge>}
                            <Badge
                              variant="outline"
                              className={
                                post.status === 'PUBLISHED' ? 'border-green-500 text-green-400' :
                                post.status === 'DRAFT' ? 'border-yellow-500 text-yellow-400' :
                                post.status === 'SCHEDULED' ? 'border-blue-500 text-blue-400' :
                                'border-gray-500 text-gray-400'
                              }
                            >
                              {post.status}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Eye className="w-3 h-3" />
                              {post.viewCount}
                            </div>
                            {post.readingTimeMinutes && (
                              <span className="text-gray-400 text-sm">{post.readingTimeMinutes} min read</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{post.excerpt}</p>
                          <div className="flex gap-2 mb-2">
                            {post.categories?.map((cat: { category: { id: string; name: string } }) => (
                              <span key={cat.category.id} className="bg-blue-700 px-2 py-1 rounded text-xs">
                                {cat.category.name}
                              </span>
                            ))}
                            {post.tags?.map((tag: { tag: { id: string; name: string } }) => (
                              <span key={tag.tag.id} className="bg-green-700 px-2 py-1 rounded text-xs">
                                {tag.tag.name}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                            {post.publishedAt && (
                              <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openPostDialog(post)} className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => deleteBlogPost(post.id)} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {blogPosts.length === 0 && (
                      <p className="text-gray-400 text-center py-8">No blog posts yet. Create your first post!</p>
                    )}
                  </div>
                )}
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

        {/* Blog Post Edit Dialog */}
        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost?.id ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            <BlogPostForm
              post={editingPost}
              onSave={saveBlogPost}
              onCancel={() => setIsPostDialogOpen(false)}
              loading={blogLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}