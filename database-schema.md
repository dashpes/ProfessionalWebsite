# Database Schema Design

## Projects & Blog Database Schema (PostgreSQL + Prisma)

### Core Tables

#### 1. Projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  github_id INTEGER UNIQUE, -- GitHub repo ID
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  readme_content TEXT,
  
  -- URLs
  github_url VARCHAR(500),
  live_url VARCHAR(500),
  image_url VARCHAR(500),
  
  -- Classification
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, archived, in_development
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  
  -- GitHub data
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  primary_language VARCHAR(100),
  repo_size INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_github_sync TIMESTAMP,
  
  -- Indexes
  INDEX idx_featured (featured),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_display_order (display_order)
);
```

#### 2. Project Technologies (Many-to-Many)
```sql
CREATE TABLE technologies (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- language, framework, database, tool, etc.
  color VARCHAR(7), -- hex color for UI
  icon_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_technologies (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2), -- percentage of codebase (from GitHub API)
  bytes_count INTEGER, -- actual bytes from GitHub
  PRIMARY KEY (project_id, technology_id)
);
```

#### 3. Blog Posts
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- MDX content
  cover_image VARCHAR(500),
  
  -- Publication
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMP,
  featured BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[], -- PostgreSQL array
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_featured (featured),
  INDEX idx_slug (slug)
);
```

#### 4. Blog Categories & Tags
```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blog_tags (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blog_post_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

#### 5. Analytics & Tracking
```sql
CREATE TABLE project_views (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer VARCHAR(500),
  viewed_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_project_viewed (project_id, viewed_at),
  INDEX idx_viewed_at (viewed_at)
);

CREATE TABLE blog_post_views (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer VARCHAR(500),
  reading_progress DECIMAL(5,2), -- 0-100%
  time_spent_seconds INTEGER,
  viewed_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_post_viewed (post_id, viewed_at),
  INDEX idx_viewed_at (viewed_at)
);
```

#### 6. GitHub Sync Log
```sql
CREATE TABLE github_sync_log (
  id UUID PRIMARY KEY,
  event_type VARCHAR(100), -- webhook, manual_sync, scheduled_sync
  repository_name VARCHAR(255),
  action VARCHAR(100), -- created, updated, deleted, etc.
  success BOOLEAN,
  error_message TEXT,
  payload JSONB, -- full webhook payload
  processed_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_processed_at (processed_at),
  INDEX idx_repository (repository_name),
  INDEX idx_success (success)
);
```

### Prisma Schema Example

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id              String   @id @default(cuid())
  githubId        Int?     @unique @map("github_id")
  name            String
  title           String
  description     String?
  readmeContent   String?  @map("readme_content")
  
  githubUrl       String?  @map("github_url")
  liveUrl         String?  @map("live_url")
  imageUrl        String?  @map("image_url")
  
  category        String?
  status          String   @default("active")
  featured        Boolean  @default(false)
  displayOrder    Int?     @map("display_order")
  
  starsCount      Int      @default(0) @map("stars_count")
  forksCount      Int      @default(0) @map("forks_count")
  primaryLanguage String?  @map("primary_language")
  repoSize        Int      @default(0) @map("repo_size")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  lastGithubSync  DateTime? @map("last_github_sync")
  
  technologies    ProjectTechnology[]
  views           ProjectView[]
  
  @@map("projects")
}

model Technology {
  id       String @id @default(cuid())
  name     String @unique
  category String?
  color    String?
  iconUrl  String? @map("icon_url")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  projects ProjectTechnology[]
  
  @@map("technologies")
}

model ProjectTechnology {
  projectId    String  @map("project_id")
  technologyId String  @map("technology_id")
  percentage   Decimal?
  bytesCount   Int?    @map("bytes_count")
  
  project    Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  technology Technology @relation(fields: [technologyId], references: [id], onDelete: Cascade)
  
  @@id([projectId, technologyId])
  @@map("project_technologies")
}

// ... (similar models for BlogPost, BlogCategory, etc.)
```

### Benefits of This Database Design

1. **Performance**: Indexed queries, normalized data
2. **Flexibility**: Easy to add new fields and relationships
3. **Analytics**: Built-in view tracking and statistics
4. **Scalability**: UUID keys, proper relationships
5. **GitHub Integration**: Tracks sync history and metadata
6. **Blog System**: Full-featured with categories, tags, SEO
7. **Future-Proof**: Room for comments, likes, user accounts

### Migration Strategy

1. **Phase 1**: Keep current JSON + GitHub API system
2. **Phase 2**: Add database alongside (dual-write)
3. **Phase 3**: Migrate read operations to database
4. **Phase 4**: Remove JSON dependencies
5. **Phase 5**: Add advanced features (comments, analytics)

This design gives you the best of both worlds - the current system works great, and you can gradually migrate to a more powerful database-driven approach.