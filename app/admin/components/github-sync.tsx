"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Github, Clock, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SyncResult {
  success: boolean
  created: number
  updated: number
  total: number
  errors?: string[]
  syncedProjects: string[]
}

interface SyncStats {
  recentSyncs: Array<{
    id: string
    eventType: string
    action: string
    success: boolean
    changesCount: number
    errorMessage?: string
    processedAt: string
    triggeredBy: string
  }>
  projectStats: Array<{
    status: string
    _count: number
  }>
  lastSuccessfulSync?: {
    processedAt: string
    changesCount: number
    triggeredBy: string
  }
}

export default function GitHubSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [stats, setStats] = useState<SyncStats | null>(null)
  const { toast } = useToast()

  // Load sync stats on component mount
  useEffect(() => {
    loadSyncStats()
  }, [])

  const loadSyncStats = async () => {
    try {
      const response = await fetch('/api/admin/github-sync', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to load sync stats:', error)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/github-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.data)
        toast({
          title: "Sync Successful!",
          description: `${data.data.created} created, ${data.data.updated} updated`,
        })
        // Reload stats after successful sync
        await loadSyncStats()
      } else {
        // Handle partial success (207) or errors
        if (response.status === 207) {
          setResult(data.data)
          toast({
            title: "Sync Completed with Errors",
            description: `${data.data.total} projects synced, but some errors occurred`,
            variant: "destructive"
          })
        } else {
          throw new Error(data.message || 'Sync failed')
        }
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
      console.error('Sync error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (success: boolean) => {
    return success ? "bg-green-500" : "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Project Sync
          </CardTitle>
          <CardDescription>
            Sync your projects from GitHub repositories to the database. This will fetch the latest project data, technologies, and statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync Button */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSync}
              disabled={isLoading}
              size="lg"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isLoading ? 'Syncing...' : 'Sync Projects'}
            </Button>
            
            {stats?.lastSuccessfulSync && (
              <div className="text-sm text-muted-foreground">
                Last sync: {formatDate(stats.lastSuccessfulSync.processedAt)} 
                ({stats.lastSuccessfulSync.changesCount} changes)
              </div>
            )}
          </div>

          {/* Sync Result */}
          {result && (
            <Alert className={result.success ? "border-green-500" : "border-orange-500"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    Sync {result.success ? 'completed successfully' : 'completed with errors'}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">✓ {result.created} created</span>
                    <span className="text-blue-600">↻ {result.updated} updated</span>
                    <span className="text-gray-600">Total: {result.total}</span>
                  </div>
                  
                  {result.syncedProjects.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        View synced projects ({result.syncedProjects.length})
                      </summary>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.syncedProjects.map(project => (
                          <Badge key={project} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                      </div>
                    </details>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-red-600">
                        View errors ({result.errors.length})
                      </summary>
                      <div className="mt-2 space-y-1">
                        {result.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Project Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.projectStats.map(stat => (
                <div key={stat.status} className="text-center">
                  <div className="text-2xl font-bold">{stat._count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {stat.status.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sync History */}
      {stats?.recentSyncs && stats.recentSyncs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Sync History
            </CardTitle>
            <CardDescription>
              Last 10 sync operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentSyncs.map(sync => (
                <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(sync.success)}`} />
                    <div>
                      <div className="font-medium">
                        {sync.action} ({sync.changesCount} changes)
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(sync.processedAt)} • by {sync.triggeredBy}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={sync.success ? "default" : "destructive"}>
                      {sync.success ? "Success" : "Error"}
                    </Badge>
                    {sync.errorMessage && (
                      <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                        {sync.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}