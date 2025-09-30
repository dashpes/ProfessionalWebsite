# Auto-Publishing Scheduled Blog Posts Setup

This guide explains how to set up automatic publishing for scheduled blog posts using GitHub Actions (100% free).

## How It Works

1. When you create a blog post with status "SCHEDULED" and set a `publishedAt` date
2. GitHub Actions runs every hour (on the hour)
3. It calls your API endpoint to check for scheduled posts that should be published
4. Any posts with `publishedAt` <= current time are automatically changed to "PUBLISHED"

## Setup Instructions

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

   **Secret 1: CRON_SECRET**
   - Name: `CRON_SECRET`
   - Value: Generate a random secret (e.g., use `openssl rand -hex 32` or just a long random string)
   - Example: `a3f8d9e2b1c4567890abcdef12345678`

   **Secret 2: SITE_URL**
   - Name: `SITE_URL`
   - Value: Your deployed site URL (without trailing slash)
   - Example: `https://your-site.herokuapp.com` or `https://yoursite.vercel.app`

### Step 2: Add CRON_SECRET to Environment Variables

Add the same `CRON_SECRET` value to your deployment platform's environment variables:

**For Heroku:**
```bash
heroku config:set CRON_SECRET=your-secret-here
```

**For Vercel:**
Go to your project → Settings → Environment Variables → Add `CRON_SECRET`

**For other platforms:**
Add `CRON_SECRET` to your environment variables in your deployment dashboard.

### Step 3: Commit and Push

The workflow file `.github/workflows/publish-scheduled-posts.yml` is already created. Just commit and push:

```bash
git add .github/workflows/publish-scheduled-posts.yml
git add app/api/blog/posts/publish-scheduled/route.ts
git commit -m "Add auto-publish for scheduled blog posts"
git push
```

### Step 4: Enable GitHub Actions (if needed)

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. If actions are disabled, click to enable them
4. You should see the "Publish Scheduled Blog Posts" workflow listed

### Step 5: Test It

You can manually trigger the workflow to test it:

1. Go to **Actions** tab
2. Click on "Publish Scheduled Blog Posts"
3. Click **Run workflow** → **Run workflow**
4. Check the logs to see if it ran successfully

Or create a test scheduled post with a past date and wait for the next hour.

## Schedule

The workflow runs **every hour at minute 0** (12:00, 1:00, 2:00, etc.).

To change the schedule, edit `.github/workflows/publish-scheduled-posts.yml` and modify the cron expression:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # - cron: '*/30 * * * *'  # Every 30 minutes
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * *'  # Daily at midnight
```

## Troubleshooting

### Workflow not running
- Check that GitHub Actions are enabled for your repository
- Verify the workflow file is in `.github/workflows/`
- Check the Actions tab for any error messages

### Unauthorized error
- Make sure `CRON_SECRET` matches in both GitHub Secrets and your deployment environment
- Verify `SITE_URL` is correct (no trailing slash)

### Posts not publishing
- Check the workflow logs in the Actions tab
- Verify your scheduled posts have `publishedAt` dates in the past
- Make sure your database connection is working

## Manual Publishing

You can also manually publish scheduled posts by calling the endpoint:

```bash
curl -X POST https://your-site.com/api/blog/posts/publish-scheduled \
  -H "Authorization: Bearer your-cron-secret"
```

## Cost

✅ **100% FREE** - GitHub Actions provides 2,000 free minutes per month for private repositories and unlimited for public repositories. This workflow uses less than 1 minute per month.