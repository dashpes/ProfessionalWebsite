import { NextResponse } from 'next/server'

const GITHUB_USERNAME = 'dashpes'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

interface GitHubRepo {
  name: string
  description: string
  stargazers_count: number
  forks_count: number
  language: string
  pushed_at: string
}

interface GitHubUser {
  public_repos: number
  created_at: string
}

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      date: string
    }
  }
}

export async function GET() {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Website'
    }

    // Add authorization if token is available
    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`
    }

    // Fetch user info and repositories
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`, { headers })
    ])

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('GitHub API request failed')
    }

    const user: GitHubUser = await userResponse.json()
    const repos: GitHubRepo[] = await reposResponse.json()

    // Fetch commit counts for all repositories
    let totalCommits = 0
    const commitPromises = repos.slice(0, 20).map(async (repo) => { // Limit to first 20 repos to avoid rate limits
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?author=${GITHUB_USERNAME}&per_page=100`,
          { headers }
        )
        if (commitsResponse.ok) {
          const commits: GitHubCommit[] = await commitsResponse.json()
          return commits.length
        }
        return 0
      } catch (error) {
        console.warn(`Failed to fetch commits for ${repo.name}:`, error)
        return 0
      }
    })

    const commitCounts = await Promise.all(commitPromises)
    totalCommits = commitCounts.reduce((sum, count) => sum + count, 0)

    // Calculate stats
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0)
    
    // Find most starred repository
    const mostStarredRepo = repos.reduce((prev, current) => 
      current.stargazers_count > prev.stargazers_count ? current : prev
    )

    // Get recent activity (most recent push)
    const recentRepo = repos.find(repo => repo.pushed_at)
    const recentActivity = recentRepo 
      ? new Date(recentRepo.pushed_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'Unknown'

    const stats = {
      totalRepos: user.public_repos,
      totalStars,
      totalForks,
      totalCommits,
      mostStarredRepo: mostStarredRepo ? {
        name: mostStarredRepo.name,
        stars: mostStarredRepo.stargazers_count,
        description: mostStarredRepo.description || 'No description available',
        language: mostStarredRepo.language || 'Unknown'
      } : null,
      recentActivity
    }

    // Cache for 10 minutes to avoid rate limiting
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300'
      }
    })

  } catch (error) {
    console.error('GitHub stats error:', error)
    
    // Return fallback data
    return NextResponse.json({
      totalRepos: 0,
      totalStars: 0,
      totalForks: 0,
      totalCommits: 0,
      mostStarredRepo: null,
      recentActivity: 'Unknown'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'public, s-maxage=60' // Cache errors for 1 minute
      }
    })
  }
}