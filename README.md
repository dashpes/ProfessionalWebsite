# Daniel Ashpes - Portfolio Website

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://danielashpes.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

A modern, full-stack portfolio website showcasing my software engineering projects, technical skills, and professional experience. Built with cutting-edge web technologies and optimized for performance, SEO, and user experience.

## 🌟 Live Demo

**[danielashpes.com](https://danielashpes.com)**

---

## 🚀 Features

### **Frontend Excellence**
- **⚡ Next.js 15** with App Router for optimal performance
- **🎨 Modern UI/UX** with Tailwind CSS and shadcn/ui components  
- **📱 Fully Responsive** design with mobile-first approach
- **🌓 Dark/Light Theme** support with smooth transitions
- **✨ Interactive Animations** and micro-interactions

### **Backend & Data**
- **🔧 Full-Stack Architecture** with Next.js API routes
- **📊 Advanced GitHub Integration** - Real-time project syncing with webhooks
- **🚀 Smart Caching System** - Intelligent cache with automatic invalidation
- **🔍 Enhanced Language Detection** - Accurate technology tagging from all repo languages
- **📧 Contact System** - Dual email service (Gmail SMTP + Resend)
- **🔐 Admin Panel** - Content management with JWT authentication
- **📝 Blog System** - MDX support for technical writing (ready for database)

### **SEO & Analytics**
- **🎯 Advanced SEO** - Comprehensive meta tags, Open Graph, Twitter Cards
- **📈 Structured Data** - JSON-LD schemas for enhanced search visibility
- **🗺️ Dynamic Sitemap** - Auto-generated XML sitemap
- **📊 Analytics** - Vercel Analytics integration
- **🔍 Search Optimization** - Optimized for technical recruiters

### **Developer Experience**
- **⚙️ TypeScript** - Full type safety across the entire stack
- **🔒 Security First** - Environment-based configuration, input validation
- **🧪 Quality Assurance** - ESLint, Prettier, strict type checking
- **🚀 CI/CD Ready** - Optimized for Vercel deployment with pnpm
- **⚡ Real-time Updates** - GitHub webhooks for instant project synchronization
- **📊 Smart Caching** - Advanced caching with automatic invalidation

---

## 🛠️ Tech Stack

### **Core Technologies**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React 19 hooks + Context

### **Backend & APIs**
- **Runtime**: Node.js (Edge Runtime)
- **APIs**: Next.js API Routes
- **Email**: Nodemailer (Gmail) + Resend
- **Authentication**: JWT + bcrypt
- **Data**: JSON-based configuration

### **External Integrations**
- **GitHub API** - Advanced project and statistics fetching with language detection
- **GitHub Webhooks** - Real-time repository synchronization
- **Vercel Analytics** - Performance and user tracking
- **Google Fonts** - Typography optimization

### **Developer Tools**
- **Linting**: ESLint + Next.js config
- **Formatting**: Prettier (configured)
- **Type Checking**: Strict TypeScript
- **Build**: Next.js compiler with SWC

---

## 🎯 Architecture Highlights

### **Performance Optimizations**
- **Static Generation** for marketing pages
- **Image Optimization** with Next.js Image component
- **Code Splitting** and lazy loading
- **Edge Runtime** for API routes
- **Smart Caching** with configurable TTL and automatic invalidation
- **Batch API Processing** to avoid rate limits
- **Optimized Bundle** size and loading times

### **SEO Implementation**
- **Page-specific metadata** for every route
- **Structured data** (Person, WebSite, BlogPosting schemas)
- **Open Graph** and Twitter Card optimization
- **Canonical URLs** and sitemap generation
- **Mobile-friendly** and Core Web Vitals optimized

### **Advanced GitHub Integration**
- **Real-time Sync** - Webhooks automatically update projects when you push code
- **Enhanced Language Detection** - Fetches all languages used in each repository
- **Smart Technology Tagging** - Infers technologies from repo patterns and GitHub topics
- **Intelligent Caching** - 1-hour cache with automatic invalidation on repo changes
- **Batch Processing** - Processes repos in batches to respect GitHub API rate limits
- **Fallback Support** - Graceful degradation if GitHub API is unavailable

### **Security Features**
- **Environment-based secrets** management
- **JWT authentication** for admin access
- **Webhook signature verification** for GitHub integration
- **Input validation** and sanitization
- **CORS protection** and rate limiting considerations
- **No sensitive data** in client-side code

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/dashpes/ProfessionalWebsite.git
   cd ProfessionalWebsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### **Environment Variables**

Create a `.env.local` file with the following variables:

```env
# Contact Form (Required)
CONTACT_EMAIL=your-email@yourdomain.com
GMAIL_USER=your-workspace-email@yourdomain.com  
GMAIL_APP_PASSWORD=your_16_character_app_password

# GitHub Integration (Recommended)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret_for_real_time_updates

# Admin Panel (Optional)
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_very_long_random_jwt_secret_key
```

#### **GitHub Integration Setup**

For real-time project updates, set up a GitHub webhook:

1. **Generate webhook secret**: `openssl rand -hex 32`
2. **Add to environment variables** (both locally and in Vercel)
3. **Create GitHub webhook**:
   - Repository Settings → Webhooks → Add webhook
   - Payload URL: `https://your-domain.com/api/webhooks/github`
   - Content type: `application/json`
   - Secret: Use the same secret from step 1
   - Events: Select "Repositories" or "Send me everything"

---

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── (routes)/          # Page routes
│   ├── api/               # API endpoints
│   │   ├── projects/      # Project data endpoints
│   │   ├── webhooks/      # GitHub webhook handlers
│   │   ├── cache/         # Cache management
│   │   └── admin/         # Admin panel APIs
│   ├── components/        # Page-specific components
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── github.ts         # Enhanced GitHub API integration
│   ├── cache.ts          # Smart caching system
│   ├── seo.ts            # SEO utilities
│   └── utils.ts          # General utilities
├── data/                 # Configuration files
│   └── projects-config.json
├── public/               # Static assets
└── hooks/                # Custom React hooks
```

---

## 🎨 Customization

### **Content Management**
- **Projects**: Edit `data/projects-config.json`
- **Personal Info**: Update `lib/seo.ts` constants
- **Styling**: Modify Tailwind config and CSS variables
- **Components**: All components are modular and customizable

### **Advanced GitHub Integration**

The site features sophisticated GitHub integration with real-time updates:

**Automatic Project Sync:**
- Fetches all your public repositories automatically
- Detects and displays all programming languages used (not just primary)
- Infers additional technologies from repo names, descriptions, and topics
- Updates instantly when you push code (via webhooks)

**Configuration:**
- **Include/exclude repos**: Edit `projects-config.json`
- **Custom project data**: Override titles, descriptions, featured status
- **Real-time updates**: Set up GitHub webhooks for instant synchronization

**Technology Detection:**
- Primary and secondary languages from GitHub API
- Framework detection (Next.js, React, Vue, etc.)
- Database and tool inference (PostgreSQL, Docker, etc.)
- GitHub topics automatically become technology tags

### **SEO Optimization**
All pages include optimized metadata. Update the SEO constants in `lib/seo.ts` to match your personal brand and target keywords.

---

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
# Deploy to Vercel via GitHub integration
```

### **Manual Deployment**
```bash
npm run build
npm run start
```

The site is optimized for Vercel deployment with automatic CI/CD via GitHub integration.

---

## 📊 Features in Detail

### **Admin Panel**
- Secure JWT-based authentication
- Project management interface
- Content updates without code changes
- Image upload and management

### **Contact System**  
- Dual email delivery (Gmail SMTP + Resend fallback)
- Form validation and spam protection
- Professional email templates
- Real-time status feedback

### **Blog System**
- MDX support for rich content
- Syntax highlighting for code blocks
- SEO-optimized article pages
- Structured data for articles

---

## 🤝 Contributing

This is a personal portfolio project, but if you find bugs or have suggestions:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🔗 Connect with Me

- **Website**: [danielashpes.com](https://danielashpes.com)
- **LinkedIn**: [linkedin.com/in/danielashpes](https://linkedin.com/in/danielashpes)
- **GitHub**: [github.com/dashpes](https://github.com/dashpes)
- **Email**: [dan@danielashpes.com](mailto:dan@danielashpes.com)

---

## 🎯 Project Goals

This portfolio demonstrates:

- **Modern Web Development** - Next.js 15, TypeScript, React 19
- **Full-Stack Capabilities** - Frontend, backend, APIs, databases
- **Professional UI/UX** - Design system, responsive layout, accessibility  
- **SEO Expertise** - Technical SEO, structured data, performance
- **DevOps Knowledge** - CI/CD, deployment, monitoring
- **Business Acumen** - User experience, conversion optimization

## 🆕 Latest Updates & Improvements

### **Recent Enhancements (Latest Version)**

**🚀 Advanced GitHub Integration**
- Real-time project synchronization via GitHub webhooks
- Enhanced language detection showing all languages per repository
- Smart technology inference from repo patterns and GitHub topics
- Intelligent caching system with automatic invalidation

**⚡ Performance Optimizations**
- Smart caching with configurable TTL (Time To Live)
- Batch API processing to respect GitHub rate limits
- Cache invalidation patterns for instant updates
- Optimized bundle size and loading times

**🔧 Developer Experience**
- pnpm package manager for faster builds
- Enhanced error handling and logging
- Admin cache management endpoints
- Comprehensive webhook security verification

### **🔮 Planned Features**

**Database Integration (PostgreSQL + Prisma)**
- Full blog system with MDX support
- Advanced project analytics and view tracking
- Comment system for blog posts
- Enhanced search and filtering capabilities

**Content Management**
- Rich text editor for blog posts
- Image upload and management system
- Draft and scheduled post publishing
- Tag and category management

**Analytics Dashboard**
- Project view statistics
- Popular technology trends
- Blog post performance metrics
- Visitor engagement analytics

---

Built with ❤️ by [Daniel Ashpes](https://danielashpes.com)