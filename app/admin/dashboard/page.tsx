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
import { Trash2, Edit, Plus, Save, LogOut, Eye, Heart, Mail, Send } from 'lucide-react'
import { ImageUpload } from '../components/image-upload'
import GitHubSync from '../components/github-sync'
import { BlogPostForm } from '../components/blog-post-form'
import { EditableProjectCard } from '../components/editable-project-card'
import { NewsletterEditor } from '../components/newsletter-editor'


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

  // Analytics state
  const [siteAnalytics, setSiteAnalytics] = useState<Record<string, unknown> | null>(null)
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, unknown> | null>(null)
  const [blogAnalytics, setBlogAnalytics] = useState<Record<string, unknown> | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30)
  const [analyticsTab, setAnalyticsTab] = useState<'site' | 'projects' | 'blog'>('site')

  // Newsletter state
  const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string; subscribed: boolean; subscribedAt: string }>>([])
  const [campaigns, setCampaigns] = useState<Array<{ id: string; subject: string; recipientCount: number; status: string; sentAt: string | null; createdAt: string }>>([])
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [campaignType, setCampaignType] = useState<'blog-post' | 'custom'>('blog-post')
  const [selectedBlogPost, setSelectedBlogPost] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

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

  const saveProject = async () => {
    if (!editingProject || !config) return

    // Auto-generate ID if not provided for manual projects
    if (editingProject.manual && !editingProject.id) {
      editingProject.id = Date.now().toString()
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('admin-token')

      if (editingProject.manual) {
        // For manual projects, save directly to backend
        const response = await fetch(`/api/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editingProject.title,
            description: editingProject.description,
            technologies: editingProject.technologies,
            image: editingProject.image,
            github: editingProject.github,
            live: editingProject.live,
            featured: editingProject.featured,
            order: editingProject.order
          })
        })

        if (response.ok) {
          toast.success('Project saved successfully!')
          setIsDialogOpen(false)
          setEditingProject(null)
          fetchConfig() // Refresh the config
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to save project')
        }
      } else {
        // For GitHub projects, update the config with overrides
        const updatedConfig = { ...config }
        if (editingProject.id) {
          updatedConfig.repoOverrides = updatedConfig.repoOverrides || {}
          updatedConfig.repoOverrides[editingProject.id] = editingProject
        }

        // Save the config
        const response = await fetch('/api/admin/projects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedConfig)
        })

        if (response.ok) {
          toast.success('Project saved successfully!')
          setConfig(updatedConfig)
          setIsDialogOpen(false)
          setEditingProject(null)
        } else {
          toast.error('Failed to save project')
        }
      }
    } catch {
      toast.error('Failed to save project')
    } finally {
      setIsSaving(false)
    }
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

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const [siteRes, projectRes, blogRes] = await Promise.all([
        fetch(`/api/admin/analytics/site?days=${analyticsPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics/projects?days=${analyticsPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/admin/analytics/blog?days=${analyticsPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ])

      if (siteRes.ok) {
        const data = await siteRes.json()
        setSiteAnalytics(data)
      }
      if (projectRes.ok) {
        const data = await projectRes.json()
        setProjectAnalytics(data)
      }
      if (blogRes.ok) {
        const data = await blogRes.json()
        setBlogAnalytics(data)
      }
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [analyticsPeriod])

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (token) {
      fetchAnalytics()
    }
  }, [fetchAnalytics])

  // Fetch newsletter data
  const fetchNewsletterData = useCallback(async () => {
    setNewsletterLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const [subscribersRes, campaignsRes] = await Promise.all([
        fetch('/api/admin/newsletter/subscribers?status=all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/newsletter/campaigns', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (subscribersRes.ok) {
        const data = await subscribersRes.json()
        setSubscribers(data.subscribers)
      }
      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaigns(data.campaigns)
      }
    } catch {
      toast.error('Failed to load newsletter data')
    } finally {
      setNewsletterLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (token) {
      fetchNewsletterData()
    }
  }, [fetchNewsletterData])

  const deleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return

    const token = localStorage.getItem('admin-token')
    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${subscriberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Subscriber deleted successfully!')
        fetchNewsletterData()
      } else {
        toast.error('Failed to delete subscriber')
      }
    } catch {
      toast.error('Failed to delete subscriber')
    }
  }

  const generatePreview = async () => {
    const token = localStorage.getItem('admin-token')

    try {
      const payload = campaignType === 'blog-post'
        ? {
            type: 'blog-post',
            blogPostId: selectedBlogPost
          }
        : {
            type: 'custom',
            subject: customSubject,
            content: customContent
          }

      const response = await fetch('/api/admin/newsletter/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        setPreviewHtml(data.html)
        setShowPreview(true)
      } else {
        toast.error(data.error || 'Failed to generate preview')
      }
    } catch {
      toast.error('Failed to generate preview')
    }
  }

  const sendCampaign = async () => {
    if (campaignType === 'blog-post' && !selectedBlogPost) {
      toast.error('Please select a blog post')
      return
    }
    if (campaignType === 'custom' && (!customSubject || !customContent)) {
      toast.error('Please fill in subject and content')
      return
    }

    if (!confirm(`Send newsletter to ${subscribers.filter(s => s.subscribed).length} subscribers?`)) return

    setSendingCampaign(true)
    const token = localStorage.getItem('admin-token')

    try {
      const payload = campaignType === 'blog-post'
        ? {
            type: 'blog-post',
            blogPostId: selectedBlogPost,
            subject: blogPosts.find(p => p.id === selectedBlogPost)?.title || 'New Blog Post'
          }
        : {
            type: 'custom',
            subject: customSubject,
            content: customContent,
            htmlContent: customContent
          }

      const response = await fetch('/api/admin/newsletter/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Campaign sent to ${data.sent} subscribers!`)
        setSelectedBlogPost('')
        setCustomSubject('')
        setCustomContent('')
        fetchNewsletterData()
      } else {
        toast.error(data.error || 'Failed to send campaign')
      }
    } catch {
      toast.error('Failed to send campaign')
    } finally {
      setSendingCampaign(false)
    }
  }

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
            <Button onClick={handleLogout} className="border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Sub-Navigation */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setAnalyticsTab('site')}
                  className={analyticsTab === 'site' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                >
                  Site-Wide
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAnalyticsTab('projects')}
                  className={analyticsTab === 'projects' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                >
                  Projects
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAnalyticsTab('blog')}
                  className={analyticsTab === 'blog' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                >
                  Blog
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setAnalyticsPeriod(7)}
                  className={analyticsPeriod === 7 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                >
                  7 Days
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAnalyticsPeriod(30)}
                  className={analyticsPeriod === 30 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                >
                  30 Days
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAnalyticsPeriod(90)}
                  className={analyticsPeriod === 90 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                >
                  90 Days
                </Button>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="mt-4 text-gray-400">Loading analytics...</p>
              </div>
            ) : analyticsTab === 'site' && siteAnalytics ? (
              <>
                {/* Summary Cards - SITE WIDE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{siteAnalytics.summary.totalViews.toLocaleString()}</div>
                      <p className="text-xs text-gray-400 mt-1">
                        {siteAnalytics.summary.recentViews} in last {analyticsPeriod} days
                        <span className={`ml-2 ${siteAnalytics.summary.viewGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {siteAnalytics.summary.viewGrowth >= 0 ? '↑' : '↓'} {Math.abs(siteAnalytics.summary.viewGrowth)}%
                        </span>
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{siteAnalytics.summary.totalProjects + siteAnalytics.summary.totalBlogPosts}</div>
                      <p className="text-xs text-gray-400 mt-1">
                        {siteAnalytics.summary.totalProjects} projects, {siteAnalytics.summary.totalBlogPosts} posts
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Avg. Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{siteAnalytics.summary.avgTimeSpentMinutes}m</div>
                      <p className="text-xs text-gray-400 mt-1">Per session</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{siteAnalytics.summary.totalLikes.toLocaleString()}</div>
                      <p className="text-xs text-gray-400 mt-1">Total likes</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Traffic Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle>Top Referrers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {siteAnalytics.topReferrers?.slice(0, 8).map((ref: { referrer: string; count: number }, index: number) => (
                          <div key={ref.referrer || index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{ref.referrer || 'Direct'}</h4>
                            </div>
                            <div className="text-sm font-semibold">{ref.count.toLocaleString()}</div>
                          </div>
                        )) || <p className="text-gray-400 text-center py-8">No referrer data yet.</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle>Content Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div>
                            <div className="text-sm text-gray-400">Project Views</div>
                            <div className="text-2xl font-bold text-blue-400">{siteAnalytics.summary.totalProjectViews.toLocaleString()}</div>
                          </div>
                          <Eye className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div>
                            <div className="text-sm text-gray-400">Blog Views</div>
                            <div className="text-2xl font-bold text-purple-400">{siteAnalytics.summary.totalBlogViews.toLocaleString()}</div>
                          </div>
                          <Eye className="w-8 h-8 text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Traffic Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle>Project Views Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {siteAnalytics.trends.projectViews?.slice(0, 14).reverse().map((day: { date: string; count: number }) => {
                          const maxCount = Math.max(...(siteAnalytics.trends.projectViews?.map((d: { count: number }) => d.count) || [1]))
                          return (
                            <div key={day.date} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-20">{day.date}</span>
                              <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min((day.count / maxCount) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-12 text-right">{day.count}</span>
                            </div>
                          )
                        }) || <p className="text-gray-400 text-center py-8">No data yet.</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle>Blog Views Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {siteAnalytics.trends.blogViews?.slice(0, 14).reverse().map((day: { date: string; count: number }) => {
                          const maxCount = Math.max(...(siteAnalytics.trends.blogViews?.map((d: { count: number }) => d.count) || [1]))
                          return (
                            <div key={day.date} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-20">{day.date}</span>
                              <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                                <div
                                  className="bg-purple-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min((day.count / maxCount) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-12 text-right">{day.count}</span>
                            </div>
                          )
                        }) || <p className="text-gray-400 text-center py-8">No data yet.</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : analyticsTab === 'projects' && projectAnalytics ? (
              <>
                {/* PROJECT ANALYTICS SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectAnalytics.summary.totalProjects}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectAnalytics.summary.totalViews.toLocaleString()}</div>
                      <p className="text-xs text-gray-400 mt-1">
                        {projectAnalytics.summary.recentViews} recent
                        <span className={`ml-2 ${projectAnalytics.summary.viewGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {projectAnalytics.summary.viewGrowth >= 0 ? '↑' : '↓'} {Math.abs(projectAnalytics.summary.viewGrowth)}%
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Likes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectAnalytics.summary.totalLikes.toLocaleString()}</div>
                      <p className="text-xs text-gray-400 mt-1">
                        {projectAnalytics.summary.recentLikes} recent
                        <span className={`ml-2 ${projectAnalytics.summary.likeGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {projectAnalytics.summary.likeGrowth >= 0 ? '↑' : '↓'} {Math.abs(projectAnalytics.summary.likeGrowth)}%
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{projectAnalytics.summary.engagementRate}%</div>
                      <p className="text-xs text-gray-400 mt-1">Likes per view</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Projects */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle>Top Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectAnalytics.topProjects?.slice(0, 10).map((project: { id: string; title: string; category?: string; viewCount: number; likeCount: number }, index: number) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-gray-600">#{index + 1}</div>
                            <div>
                              <h4 className="font-semibold">{project.title}</h4>
                              {project.category && (
                                <Badge className="bg-purple-600 mt-1">{project.category}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <Eye className="w-4 h-4 inline mr-1 text-blue-400" />
                              <span className="font-semibold">{project.viewCount.toLocaleString()}</span>
                            </div>
                            <div>
                              <Heart className="w-4 h-4 inline mr-1 text-red-400" />
                              <span className="font-semibold">{project.likeCount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-gray-400 text-center py-8">No projects yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : analyticsTab === 'blog' && blogAnalytics ? (
              <>
                {/* BLOG ANALYTICS SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{blogAnalytics.summary.publishedPosts}</div>
                      <p className="text-xs text-gray-400 mt-1">{blogAnalytics.summary.draftPosts} drafts</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{blogAnalytics.summary.totalViews.toLocaleString()}</div>
                      <p className="text-xs text-gray-400 mt-1">
                        {blogAnalytics.summary.recentViews} recent
                        <span className={`ml-2 ${blogAnalytics.summary.viewGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {blogAnalytics.summary.viewGrowth >= 0 ? '↑' : '↓'} {Math.abs(blogAnalytics.summary.viewGrowth)}%
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Avg. Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{blogAnalytics.summary.avgTimeSpentMinutes}m</div>
                      <p className="text-xs text-gray-400 mt-1">Per post</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{blogAnalytics.summary.completionRate}%</div>
                      <p className="text-xs text-gray-400 mt-1">Avg. reading progress</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Posts */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle>Top Blog Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {blogAnalytics.topPosts?.slice(0, 10).map((post: { id: string; title: string; readingTimeMinutes: number; viewCount: number }, index: number) => (
                        <div key={post.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-lg font-bold text-gray-600">#{index + 1}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{post.title}</h4>
                              <p className="text-xs text-gray-400">{post.readingTimeMinutes} min read</p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">{post.viewCount.toLocaleString()} views</div>
                        </div>
                      )) || <p className="text-gray-400 text-center py-8">No posts yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400">Loading analytics...</p>
              </div>
            )}
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

          <TabsContent value="newsletter" className="space-y-6">
            {/* Subscribers */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Subscribers</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {subscribers.filter(s => s.subscribed).length} active subscribers
                    </p>
                  </div>
                  <Badge className="bg-blue-600">
                    <Mail className="w-3 h-3 mr-1" />
                    {subscribers.filter(s => s.subscribed).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {newsletterLoading ? (
                  <div className="text-center py-8">Loading subscribers...</div>
                ) : (
                  <div className="space-y-2">
                    <div className="max-h-96 overflow-y-auto">
                      {subscribers.map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2">
                          <div>
                            <p className="font-medium">{subscriber.email}</p>
                            <p className="text-xs text-gray-400">
                              {subscriber.subscribed ? 'Active' : 'Unsubscribed'} • Joined {new Date(subscriber.subscribedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={subscriber.subscribed ? 'default' : 'outline'} className={subscriber.subscribed ? 'bg-green-600' : 'text-gray-400'}>
                              {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                            </Badge>
                            <Button size="sm" onClick={() => deleteSubscriber(subscriber.id)} className="bg-red-600 hover:bg-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {subscribers.length === 0 && (
                        <p className="text-gray-400 text-center py-8">No subscribers yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Campaign */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Send Newsletter Campaign</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Send an email to all {subscribers.filter(s => s.subscribed).length} active subscribers
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Campaign Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      onClick={() => setCampaignType('blog-post')}
                      className={campaignType === 'blog-post' ? 'bg-purple-600 hover:bg-purple-700' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'}
                    >
                      Blog Post Announcement
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCampaignType('custom')}
                      className={campaignType === 'custom' ? 'bg-purple-600 hover:bg-purple-700' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'}
                    >
                      Custom Message
                    </Button>
                  </div>
                </div>

                {campaignType === 'blog-post' && (
                  <div>
                    <Label htmlFor="blogPostSelect">Select Blog Post</Label>
                    <select
                      id="blogPostSelect"
                      value={selectedBlogPost}
                      onChange={(e) => setSelectedBlogPost(e.target.value)}
                      className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white"
                    >
                      <option value="">Choose a blog post...</option>
                      {blogPosts.filter(p => p.status === 'PUBLISHED').map((post) => (
                        <option key={post.id} value={post.id}>
                          {post.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {campaignType === 'custom' && (
                  <>
                    <div>
                      <Label htmlFor="customSubject">Email Subject</Label>
                      <Input
                        id="customSubject"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="bg-gray-800 border-gray-600"
                        placeholder="Your email subject..."
                      />
                    </div>
                    <div>
                      <Label>Email Content</Label>
                      <p className="text-xs text-gray-400 mb-2">
                        Use the editor below to format your message. Unsubscribe link will be automatically added to the footer.
                      </p>
                      <NewsletterEditor
                        content={customContent}
                        onChange={setCustomContent}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={generatePreview}
                    disabled={
                      (campaignType === 'blog-post' && !selectedBlogPost) ||
                      (campaignType === 'custom' && (!customSubject || !customContent))
                    }
                    className="flex-1 border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={sendCampaign}
                    disabled={sendingCampaign || subscribers.filter(s => s.subscribed).length === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendingCampaign ? 'Sending...' : `Send to ${subscribers.filter(s => s.subscribed).length}`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign History */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Past email campaigns sent to subscribers
                </p>
              </CardHeader>
              <CardContent>
                {newsletterLoading ? (
                  <div className="text-center py-8">Loading campaigns...</div>
                ) : (
                  <div className="space-y-2">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{campaign.subject}</h3>
                          <p className="text-sm text-gray-400">
                            {campaign.recipientCount} recipients • {campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : 'Not sent'}
                          </p>
                        </div>
                        <Badge variant="outline" className={
                          campaign.status === 'SENT' ? 'border-green-500 text-green-400' :
                          campaign.status === 'SENDING' ? 'border-blue-500 text-blue-400' :
                          campaign.status === 'FAILED' ? 'border-red-500 text-red-400' :
                          'border-gray-500 text-gray-400'
                        }>
                          {campaign.status}
                        </Badge>
                      </div>
                    ))}
                    {campaigns.length === 0 && (
                      <p className="text-gray-400 text-center py-8">No campaigns sent yet.</p>
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
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject?.id ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
            </DialogHeader>
            {editingProject && (
              <div className="space-y-4">
                {editingProject.manual && (
                  <div>
                    <Label htmlFor="projectId">Project ID (optional)</Label>
                    <Input
                      id="projectId"
                      value={editingProject.id || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Leave blank to auto-generate"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Unique identifier for the project. Auto-generated if left blank.
                    </p>
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
                  <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="border-gray-600 text-black hover:bg-gray-100" disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={saveProject} className="bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Project'}
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

        {/* Email Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
              <p className="text-sm text-gray-400 mt-1">
                This is how your email will look to subscribers
              </p>
            </DialogHeader>
            <div className="bg-white rounded-lg p-4">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setShowPreview(false)} variant="outline" className="border-gray-600 text-black hover:bg-gray-100">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}