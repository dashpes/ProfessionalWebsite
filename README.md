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
- **📊 GitHub Integration** - Dynamic project fetching and stats
- **📧 Contact System** - Dual email service (Gmail SMTP + Resend)
- **🔐 Admin Panel** - Content management with JWT authentication
- **📝 Blog System** - MDX support for technical writing

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
- **🚀 CI/CD Ready** - Optimized for Vercel deployment

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
- **GitHub API** - Project and statistics fetching
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
- **Optimized Bundle** size and loading times

### **SEO Implementation**
- **Page-specific metadata** for every route
- **Structured data** (Person, WebSite, BlogPosting schemas)
- **Open Graph** and Twitter Card optimization
- **Canonical URLs** and sitemap generation
- **Mobile-friendly** and Core Web Vitals optimized

### **Security Features**
- **Environment-based secrets** management
- **JWT authentication** for admin access
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

# GitHub Integration (Optional - for higher API limits)
GITHUB_TOKEN=your_github_personal_access_token

# Admin Panel (Optional)
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_very_long_random_jwt_secret_key
```

---

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── (routes)/          # Page routes
│   ├── api/               # API endpoints
│   ├── components/        # Page-specific components
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
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

### **GitHub Integration**
The site automatically fetches and displays your GitHub repositories. Configure which repos to show/hide in `projects-config.json`.

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

Built with ❤️ by [Daniel Ashpes](https://danielashpes.com)