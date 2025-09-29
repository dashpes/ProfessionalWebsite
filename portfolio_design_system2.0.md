# Portfolio Website Design System v2.0
**Senior UI/UX Engineer - Refined Design Guidelines**

---

## 1. Design Philosophy & Brand Direction

Drawing from gorpcore aesthetics (Arc'teryx, Mountain Hardware, Patagonia), we're building a design system that embodies:

- **Technical precision** - Clean, functional interfaces that prioritize usability
- **Premium materiality** - Glassmorphism and subtle textures suggesting quality craftsmanship
- **Performance-driven** - Every element serves a purpose, no decoration for decoration's sake
- **Adventurous minimalism** - Bold enough to stand out, refined enough to remain timeless
- **Liquid glass aesthetic** - Transparent, frosted components with depth and layering

The cream and purple palette creates unexpected sophistication. The glassmorphism approach for interactive elements (buttons, cards, inputs) adds a modern, premium feel reminiscent of high-end outdoor gear with technical materials.

---

## 2. Color Palette & Psychological Reasoning

### Primary Colors

**Cream (Base Background)**
- Hex: `#F5F2E8` - Warm Cream
- **Psychology**: Calming, sophisticated, reduces eye strain. Creates breathing room and suggests thoughtfulness. More inviting than stark white while maintaining professionalism.
- **Usage**: Primary background, main canvas, full-page background

**Royal Purple (Primary Action)**
- Hex: `#5B2C91` - Deep Royal Purple
- **Psychology**: Conveys creativity, wisdom, and premium quality. Associated with innovation and high-end brands. This richness commands attention without aggression.
- **Usage**: CTAs, interactive elements, hover states, accent highlights, wave lines

### Secondary Colors

**Charcoal (Typography Primary)**
- Hex: `#2A2A2A` - Deep Charcoal
- **Psychology**: Authority and readability without the harshness of pure black. Softer on eyes against cream.
- **Usage**: Body text, headings, primary content

**Slate Gray (Typography Secondary)**
- Hex: `#6B6B6B` - Medium Slate
- **Psychology**: Hierarchy and information architecture. Professional and neutral.
- **Usage**: Secondary text, captions, metadata

**Lavender (Interactive Hover)**
- Hex: `#8B6DB8` - Soft Lavender
- **Psychology**: Approachable variation of purple. Signals interactivity while remaining elegant.
- **Usage**: Hover states, active states, focus indicators

**Deep Plum (Shadows & Depth)**
- Hex: `#3D1B5C` - Deep Plum
- **Psychology**: Creates depth and dimensionality. Adds gravitas to the purple family.
- **Usage**: Shadows on purple elements, wave line depth variations, borders

### Glassmorphism Colors (NEW)

**Glass White (Frosted Glass Base)**
- Hex: `#FFFFFF` at 10-20% opacity
- **Psychology**: Modern, premium, depth. Creates layering effect.
- **Usage**: Button backgrounds, card backgrounds, nav bars

**Glass Purple (Frosted Purple Tint)**
- Hex: `#5B2C91` at 5-15% opacity
- **Psychology**: Subtle brand presence, technical sophistication
- **Usage**: Button hover states, active element backgrounds

### Accent & Utility Colors

**Warm Beige (Elevated Surfaces - Non-Glass)**
- Hex: `#E8E3D5` - Warm Beige
- **Psychology**: Subtle elevation, creates hierarchy without stark contrast.
- **Usage**: Solid card backgrounds (when glass isn't appropriate), section breaks

**Success Green**
- Hex: `#3D7C5B` - Forest Green (gorpcore nod)
- **Psychology**: Natural, growth-oriented. Ties to outdoor aesthetic.
- **Usage**: Success states, form validation

**Alert Terracotta**
- Hex: `#C16B4F` - Muted Terracotta
- **Psychology**: Attention without alarm. Warm and approachable.
- **Usage**: Warnings, important notices

**Error Burgundy**
- Hex: `#8B3A3A` - Deep Burgundy
- **Psychology**: Serious but not aggressive. Complements the purple family.
- **Usage**: Error states, form errors

### CSS Custom Properties - Complete Color System

```css
:root {
  /* Primary Colors */
  --color-cream-base: #F5F2E8;
  --color-purple-primary: #5B2C91;
  
  /* Secondary Colors */
  --color-charcoal: #2A2A2A;
  --color-slate: #6B6B6B;
  --color-lavender: #8B6DB8;
  --color-plum: #3D1B5C;
  
  /* Glassmorphism */
  --glass-white: rgba(255, 255, 255, 0.15);
  --glass-white-hover: rgba(255, 255, 255, 0.25);
  --glass-purple: rgba(91, 44, 145, 0.1);
  --glass-purple-hover: rgba(91, 44, 145, 0.15);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: 12px;
  
  /* Accent Colors */
  --color-beige: #E8E3D5;
  --color-success: #3D7C5B;
  --color-alert: #C16B4F;
  --color-error: #8B3A3A;
  
  /* Shadow Colors */
  --shadow-light: rgba(91, 44, 145, 0.08);
  --shadow-medium: rgba(91, 44, 145, 0.15);
  --shadow-heavy: rgba(91, 44, 145, 0.25);
}
```

---

## 3. Typography System & Hierarchy

### Font Choices

**Primary Font: Inter**
- **Rationale**: Modern, geometric sans-serif with excellent readability. Clean and professional without being corporate.
- **Weights**: 700 (Bold), 600 (Semibold), 500 (Medium), 400 (Regular)
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

### Core Typography Pattern - IMPLEMENTED STANDARD

**This is the exact pattern to follow for all content sections across the website.**

#### Primary Text Hierarchy (Hero/Content Sections)

**Main Headline - Large & Bold**
```css
/* Tailwind Classes */
.primary-headline {
  @apply text-3xl md:text-5xl font-bold mb-6 text-center;
  color: #5B2C91; /* Purple Primary */
}
```

**Example**: "Senior Software Engineer & Data Scientist"

**Description Text - Readable & Accessible**
```css
/* Tailwind Classes */
.description-text {
  @apply text-lg leading-relaxed mb-8 text-center max-w-4xl mx-auto;
  color: #2A2A2A; /* Charcoal */
}
```

**Example**: "Crafting technical solutions with precision engineering. Specializing in React, Next.js, Python, and data-driven applications that perform under pressure."

#### Button Group Pattern

**Three-Button Layout**
```css
.button-group {
  @apply flex flex-col sm:flex-row gap-4 justify-center items-center;
}

.outline-purple-button {
  @apply border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px];
}
```

**Button Text Examples**:
- "View My Work" (Primary action)
- "Get to Know Me" (Secondary)
- "Get in Touch" (Secondary)

**Note**: All buttons use the same outline style - no primary/secondary visual distinction, just semantic meaning.

### Complete Implementation Example

**React/TSX Implementation**:
```tsx
<section className="container mx-auto px-4 py-16 md:py-24 min-h-screen flex flex-col justify-center items-center">
  <div className="w-full max-w-4xl mx-auto">
    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center" style={{color: '#5B2C91'}}>
      Senior Software Engineer & Data Scientist
    </h2>
    <p className="text-lg leading-relaxed mb-8 text-center max-w-4xl mx-auto" style={{color: '#2A2A2A'}}>
      Crafting technical solutions with precision engineering. Specializing in React, Next.js, Python, and data-driven applications that perform under pressure.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
        View My Work
      </Button>
      <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
        Get to Know Me
      </Button>
      <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
        Get in Touch
      </Button>
    </div>
  </div>
</section>
```

### Typography Color Specifications

**Primary Colors for Text**:
- **Headlines/Titles**: `#5B2C91` (Purple Primary) - Commands attention
- **Body Text**: `#2A2A2A` (Charcoal) - Maximum readability
- **Secondary Text**: `#6B6B6B` (Slate) - For metadata/captions

### Design Principles Applied

1. **Readable First**: Text sizes are generous and prioritize readability over design system theory
2. **Clear Hierarchy**: Purple headlines create clear visual hierarchy
3. **Accessible Contrast**: Charcoal text ensures readability on cream background
4. **Functional Buttons**: Solid outline style with clear borders and hover states for maximum usability
5. **Centered Layout**: Content is centered and contained within max-width containers
6. **Responsive**: Scales appropriately on mobile while maintaining readability

### Implementation Rules for AI Agents

**CRITICAL**: Always use this exact pattern for content sections:
1. Use `text-3xl md:text-5xl font-bold` for headlines
2. Use `text-lg leading-relaxed` for body text
3. Use solid colors (`#5B2C91` and `#2A2A2A`) - NO gradients
4. Use outline Button components with `border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white` classes
5. Center all content with appropriate max-width containers
6. Add `min-w-[160px]` to buttons for consistency

**Do NOT**:
- Use glassmorphism button styles (use solid outline buttons instead)
- Use gradient text effects
- Use gray text that's hard to read
- Create text smaller than `text-lg` for body copy
- Forget button minimum widths
- Mix button styles (all buttons should use the same outline pattern)

---

## 4. Spacing System & Grid Approach

### Spacing Scale (8px Base Unit)

Using an 8-point grid system for consistency and mathematical harmony:

```css
:root {
  /* Spacing Tokens */
  --space-2xs: 0.25rem;  /* 4px */
  --space-xs: 0.5rem;    /* 8px */
  --space-sm: 1rem;      /* 16px */
  --space-md: 1.5rem;    /* 24px */
  --space-lg: 2rem;      /* 32px */
  --space-xl: 3rem;      /* 48px */
  --space-2xl: 4rem;     /* 64px */
  --space-3xl: 6rem;     /* 96px */
  --space-4xl: 8rem;     /* 128px */
}
```

### Component Spacing - Desktop & Mobile

**Hero Section Padding**

**Desktop:**
```css
.hero-section {
  padding: 120px 48px;
  min-height: 100vh;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .hero-section {
    padding: 80px 24px;
    min-height: 100vh;
  }
}
```

---

**Section Spacing**

**Desktop:**
```css
.section {
  padding: 128px 48px; /* Vertical: 128px, Horizontal: 48px */
  margin-bottom: 96px;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .section {
    padding: 64px 24px;
    margin-bottom: 48px;
  }
}
```

---

**Card Internal Padding**

**Desktop:**
```css
.card {
  padding: 48px;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .card {
    padding: 32px;
  }
}
```

---

**Card Grid Gaps**

**Desktop:**
```css
.card-grid {
  gap: 48px; /* Space between cards */
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .card-grid {
    gap: 24px;
  }
}
```

---

**Button Group Spacing**

**Desktop:**
```css
.hero-cta-group {
  gap: 24px;
  margin-top: 48px;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .hero-cta-group {
    gap: 16px;
    margin-top: 32px;
  }
}
```

---

**Hero Element Spacing**

**Desktop:**
```css
.hero-name {
  margin-bottom: 32px;
}

.hero-subtitle {
  margin-bottom: 48px;
}

.hero-description {
  margin-bottom: 48px;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .hero-name {
    margin-bottom: 24px;
  }
  
  .hero-subtitle {
    margin-bottom: 32px;
  }
  
  .hero-description {
    margin-bottom: 32px;
  }
}
```

---

### Grid System

**Desktop (1440px max-width container)**
```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}

.grid-desktop {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 48px;
}
```

**Tablet (768px - 1023px)**
```css
@media (max-width: 1023px) and (min-width: 768px) {
  .container {
    padding: 0 32px;
  }
  
  .grid-tablet {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 32px;
  }
}
```

**Mobile (< 768px)**
```css
@media (max-width: 767px) {
  .container {
    padding: 0 24px;
  }
  
  .grid-mobile {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}
```

---

## 5. Glassmorphism Components

### Design Principles for Glass Elements

**Glassmorphism Characteristics:**
- Semi-transparent backgrounds (10-20% opacity)
- Backdrop blur effect (8-16px)
- Subtle borders (light, semi-transparent)
- Layered depth with shadows
- Smooth, rounded corners
- Light reflections and highlights

**When to Use Glass:**
- Navigation bars
- Cards (project cards, info cards)
- Input fields
- Modal/dialog overlays
- Floating action buttons

**When NOT to Use Glass:**
- Primary/secondary buttons (use solid outline style instead for better visibility and usability)

---

### Button Components

We use solid outline buttons instead of glassmorphism for better visibility and usability. All buttons use the purple primary color with clean hover effects.

**Primary/Secondary Button Pattern - Current Implementation**

```tsx
// React Component Implementation (using Shadcn/UI Button)
<Button
  size="lg"
  variant="outline"
  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]"
>
  Button Text
</Button>
```

**CSS Implementation:**

```css
.btn-outline-purple {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Spacing */
  padding: 12px 24px; /* lg size */
  min-width: 160px;

  /* Typography */
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 16px;

  /* Colors & Border */
  color: #5B2C91;
  background-color: transparent;
  border: 1px solid #5B2C91;
  border-radius: 6px;

  /* Interaction */
  cursor: pointer;
  text-decoration: none;
  transition: all 300ms ease;
  user-select: none;
}

.btn-outline-purple:hover {
  background-color: #5B2C91;
  color: white;
}

.btn-outline-purple:focus-visible {
  outline: 2px solid #5B2C91;
  outline-offset: 2px;
}
```

**Button Group Pattern:**

```tsx
// Three-button layout used in hero and content sections
<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
    View My Work
  </Button>
  <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
    Get to Know Me
  </Button>
  <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
    Get in Touch
  </Button>
</div>
```

**Mobile Responsive:**
```css
@media (max-width: 767px) {
  .btn-outline-purple {
    width: 100%;
    padding: 14px 28px;
  }

  /* Button group stacks vertically on mobile */
  .button-group {
    flex-direction: column;
    width: 100%;
    max-width: 320px;
    gap: 16px;
  }
}
```

---

### Glass Card Component

**Desktop:**
```css
.card-glass {
  /* Layout */
  display: flex;
  flex-direction: column;
  
  /* Spacing */
  padding: 48px;
  
  /* Glass Effect */
  background: var(--glass-white);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  
  /* Border & Shape */
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  
  /* Shadow */
  box-shadow: 
    0 8px 32px var(--shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  
  /* Interaction */
  transition: all 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-glass:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 48px var(--shadow-medium),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border-color: rgba(91, 44, 145, 0.3);
}

.card-glass-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 24px;
  line-height: 1.3;
}

.card-glass-content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-charcoal);
  opacity: 0.9;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .card-glass {
    padding: 32px;
    border-radius: 16px;
  }
  
  .card-glass-title {
    font-size: 22px;
    margin-bottom: 16px;
  }
  
  .card-glass-content {
    font-size: 16px;
    line-height: 1.7;
  }
}
```

---

### Glass Input Component

**Desktop:**
```css
.input-glass {
  /* Layout */
  width: 100%;
  
  /* Spacing */
  padding: 16px 24px;
  
  /* Typography */
  font-family: var(--font-primary);
  font-size: 16px;
  color: var(--color-charcoal);
  
  /* Glass Effect */
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* Border & Shape */
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  
  /* Shadow */
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  
  /* Interaction */
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  outline: none;
}

.input-glass::placeholder {
  color: var(--color-slate);
  opacity: 0.7;
}

.input-glass:hover {
  border-color: var(--color-purple-primary);
}

.input-glass:focus {
  background: rgba(255, 255, 255, 0.35);
  border-color: var(--color-purple-primary);
  box-shadow: 
    0 0 0 4px rgba(91, 44, 145, 0.1),
    inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.input-glass:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .input-glass {
    padding: 14px 20px;
    font-size: 16px; /* Keep at 16px to prevent iOS zoom */
  }
}
```

---

### Glass Navigation Bar

**Desktop:**
```css
.nav-glass {
  /* Layout */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  
  /* Spacing */
  padding: 20px 48px;
  
  /* Glass Effect */
  background: rgba(245, 242, 232, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  
  /* Border */
  border-bottom: 1px solid var(--glass-border);
  
  /* Shadow */
  box-shadow: 0 2px 16px rgba(91, 44, 145, 0.05);
}

.nav-content {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-purple-primary);
  text-decoration: none;
  transition: opacity 200ms;
}

.nav-logo:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-charcoal);
  text-decoration: none;
  transition: color 200ms;
}

.nav-link:hover {
  color: var(--color-purple-primary);
}
```

**Mobile:**
```css
@media (max-width: 767px) {
  .nav-glass {
    padding: 16px 24px;
  }
  
  .nav-links {
    gap: 20px;
    font-size: 13px;
  }
}
```

---

## 6. Motion Principles & Interaction Guidelines

### Core Philosophy

Motion should feel **purposeful and physical**—like precision outdoor gear. Glassmorphism adds a liquid, flowing quality. Every animation provides feedback, guides attention, or reveals hierarchy.

### Timing & Easing

```css
:root {
  /* Duration */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  --duration-deliberate: 700ms;
  
  /* Easing */
  --ease-out-expo: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-back-out: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Animation Patterns

**1. Hover States (Fast - 200ms)**

```css
/* Outline Button Hover */
.btn-outline-purple:hover {
  background-color: #5B2C91;
  color: white;
  transition: all 200ms var(--ease-out-expo);
}

/* Card Hover */
.card-glass:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px var(--shadow-medium);
  transition: all 300ms var(--ease-out-expo);
}
```

**2. Click/Active States (Instant - 100ms)**

```css
.btn-outline-purple:active {
  transform: scale(0.98);
  transition: transform 100ms ease-in;
}
```

**3. Focus States (Fast - 200ms)**

```css
.input-glass:focus {
  border-color: var(--color-purple-primary);
  box-shadow: 0 0 0 4px rgba(91, 44, 145, 0.1);
  transition: all 200ms var(--ease-out-expo);
}
```

**4. Wave Lines Animation (Base - 300ms)**

```css
.wave-line {
  stroke: var(--color-purple-primary);
  stroke-width: 1.5;
  fill: none;
  opacity: 0.3;
  animation: waveFloat 8s ease-in-out infinite;
}

.wave-line:nth-child(2) { animation-delay: 1s; opacity: 0.2; }
.wave-line:nth-child(3) { animation-delay: 2s; opacity: 0.25; }
.wave-line:nth-child(4) { animation-delay: 3s; opacity: 0.15; }

@keyframes waveFloat {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-8px) translateX(4px); }
  50% { transform: translateY(-4px) translateX(-4px); }
  75% { transform: translateY(-12px) translateX(2px); }
}
```

**5. Hero Entrance Animation (Deliberate - 700ms)**

```css
.hero-name {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 200ms;
}

.hero-subtitle {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 400ms;
}

.hero-description {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 600ms;
}

.hero-cta-group {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 800ms;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**6. Card Entrance on Scroll (Base - 300ms)**

```css
.card-glass {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 300ms var(--ease-out-expo),
              transform 300ms var(--ease-out-expo);
}

.card-glass.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger delay (add via JS or CSS) */
.card-glass:nth-child(1) { transition-delay: 0ms; }
.card-glass:nth-child(2) { transition-delay: 100ms; }
.card-glass:nth-child(3) { transition-delay: 200ms; }
```

### Accessibility - Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Complete Hero Section Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daniel Ashpes - Portfolio</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  
  <!-- Glass Navigation -->
  <nav class="nav-glass">
    <div class="nav-content">
      <a href="#" class="nav-logo">DA</a>
      <ul class="nav-links">
        <li><a href="#work" class="nav-link">Work</a></li>
        <li><a href="#about" class="nav-link">About</a></li>
        <li><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero-section" id="home">
    <div class="container-hero">
      <h1 class="hero-name">Daniel Ashpes</h1>
      <h2 class="hero-subtitle">Senior Software Engineer & Data Scientist</h2>
      <p class="hero-description">
        Crafting technical solutions with precision engineering. Specializing 
        in React, Next.js, Python, and data-driven applications.
      </p>
      <div class="hero-cta-group">
        <a href="#work" class="btn-outline-purple">View My Work</a>
        <a href="#about" class="btn-outline-purple">Get to Know Me</a>
        <a href="#contact" class="btn-outline-purple">Get in Touch</a>
      </div>
    </div>
    
    <!-- Wave Background -->
    <div class="wave-container" aria-hidden="true">
      <svg class="wave-lines" viewBox="0 0 1440 800" preserveAspectRatio="none">
        <path class="wave-line" d="M0,400 Q360,350 720,400 T1440,400" />
        <path class="wave-line" d="M0,450 Q360,400 720,450 T1440,450" />
        <path class="wave-line" d="M0,350 Q360,300 720,350 T1440,350" />
        <path class="wave-line" d="M0,300 Q360,250 720,300 T1440,300" />
      </svg>
    </div>
  </section>

  <!-- Work Section -->
  <section class="section section-work" id="work">
    <div class="container">
      <h3 class="section-header">My Work</h3>
      
      <div class="card-grid">
        <article class="card-glass">
          <h4 class="card-glass-title">Project Name</h4>
          <p class="card-glass-content">
            Description of the project, technologies used, and impact created.
          </p>
          <div class="card-footer">
            <a href="#" class="btn-outline-purple">View Project</a>
          </div>
        </article>
        
        <article class="card-glass">
          <h4 class="card-glass-title">Another Project</h4>
          <p class="card-glass-content">
            Description of the project, technologies used, and impact created.
          </p>
          <div class="card-footer">
            <a href="#" class="btn-outline-purple">View Project</a>
          </div>
        </article>
      </div>
    </div>
  </section>

</body>
</html>
```

---

## 8. Complete CSS Foundation

```css
/* ============================================
   RESET & BASE STYLES
   ============================================ */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--color-cream-base);
  color: var(--color-charcoal);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* ============================================
   CSS CUSTOM PROPERTIES
   ============================================ */

:root {
  /* Colors */
  --color-cream-base: #F5F2E8;
  --color-purple-primary: #5B2C91;
  --color-charcoal: #2A2A2A;
  --color-slate: #6B6B6B;
  --color-lavender: #8B6DB8;
  --color-plum: #3D1B5C;
  --color-beige: #E8E3D5;
  --color-success: #3D7C5B;
  --color-alert: #C16B4F;
  --color-error: #8B3A3A;
  
  /* Glassmorphism */
  --glass-white: rgba(255, 255, 255, 0.15);
  --glass-white-hover: rgba(255, 255, 255, 0.25);
  --glass-purple: rgba(91, 44, 145, 0.1);
  --glass-purple-hover: rgba(91, 44, 145, 0.15);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: 12px;
  
  /* Shadows */
  --shadow-light: rgba(91, 44, 145, 0.08);
  --shadow-medium: rgba(91, 44, 145, 0.15);
  --shadow-heavy: rgba(91, 44, 145, 0.25);
  
  /* Fonts */
  --font-primary: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Typography - Desktop */
  --text-hero: 120px;
  --text-h2: 36px;
  --text-h3: 56px;
  --text-h4: 28px;
  --text-lg: 22px;
  --text-base: 18px;
  --text-sm: 14px;
  
  /* Font Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  
  /* Spacing */
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 8rem;
  
  /* Animation */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  --duration-deliberate: 700ms;
  
  --ease-out-expo: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-back-out: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Mobile Typography Adjustments */
@media (max-width: 767px) {
  :root {
    --text-hero: 48px;
    --text-h2: 24px;
    --text-h3: 36px;
    --text-h4: 22px;
    --text-lg: 18px;
    --text-base: 16px;
  }
}

/* ============================================
   LAYOUT CONTAINERS
   ============================================ */

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}

.container-hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

@media (max-width: 767px) {
  .container,
  .container-hero {
    padding: 0 24px;
  }
}

/* ============================================
   HERO SECTION
   ============================================ */

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 120px 48px;
  overflow: hidden;
}

@media (max-width: 767px) {
  .hero-section {
    padding: 80px 24px;
  }
}

.hero-name {
  font-family: var(--font-primary);
  font-weight: var(--weight-bold);
  font-size: var(--text-hero);
  line-height: 1.0;
  letter-spacing: -0.03em;
  color: var(--color-charcoal);
  text-align: center;
  margin-bottom: 32px;
  
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 200ms;
}

.hero-subtitle {
  font-family: var(--font-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-h2);
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-purple-primary);
  text-align: center;
  margin-bottom: 48px;
  
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 400ms;
}

.hero-description {
  font-family: var(--font-primary);
  font-weight: var(--weight-regular);
  font-size: var(--text-lg);
  line-height: 1.7;
  color: var(--color-charcoal);
  text-align: center;
  max-width: 800px;
  margin: 0 auto 48px;
  
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 600ms;
}

.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 700ms var(--ease-out-expo) forwards;
  animation-delay: 800ms;
}

@media (max-width: 767px) {
  .hero-name {
    margin-bottom: 24px;
  }
  
  .hero-subtitle {
    margin-bottom: 32px;
  }
  
  .hero-description {
    margin-bottom: 32px;
  }
  
  .hero-cta-group {
    flex-direction: column;
    width: 100%;
    max-width: 320px;
    gap: 16px;
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   WAVE BACKGROUND
   ============================================ */

.wave-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
}

.wave-lines {
  width: 100%;
  height: 100%;
}

.wave-line {
  stroke: var(--color-purple-primary);
  stroke-width: 1.5;
  fill: none;
  opacity: 0.3;
  animation: waveFloat 8s ease-in-out infinite;
}

.wave-line:nth-child(2) {
  animation-delay: 1s;
  opacity: 0.2;
}

.wave-line:nth-child(3) {
  animation-delay: 2s;
  opacity: 0.25;
}

.wave-line:nth-child(4) {
  animation-delay: 3s;
  opacity: 0.15;
}

@keyframes waveFloat {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-8px) translateX(4px);
  }
  50% {
    transform: translateY(-4px) translateX(-4px);
  }
  75% {
    transform: translateY(-12px) translateX(2px);
  }
}

.hero-section > .container-hero {
  position: relative;
  z-index: 1;
}

/* ============================================
   SECTIONS
   ============================================ */

.section {
  padding: 128px 48px;
  position: relative;
}

@media (max-width: 767px) {
  .section {
    padding: 64px 24px;
  }
}

.section-header {
  font-family: var(--font-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-h3);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-charcoal);
  margin-bottom: 64px;
  text-align: center;
}

@media (max-width: 767px) {
  .section-header {
    margin-bottom: 40px;
  }
}

/* ============================================
   CARD GRID
   ============================================ */

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 48px;
  margin-top: 64px;
}

@media (max-width: 767px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 40px;
  }
}

/* ============================================
   ACCESSIBILITY
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

:focus-visible {
  outline: 2px solid var(--color-purple-primary);
  outline-offset: 4px;
}

.skip-to-main {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-purple-primary);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  z-index: 1000;
  font-weight: 600;
  text-decoration: none;
  transition: top var(--duration-fast);
}

.skip-to-main:focus {
  top: 24px;
}
```

---

## 9. Implementation Checklist

### Phase 1: Foundation
- [ ] Import Inter font (weights: 400, 500, 600, 700)
- [ ] Import JetBrains Mono font (weight: 400)
- [ ] Set up all CSS custom properties
- [ ] Configure base styles and reset
- [ ] Test responsive breakpoints

### Phase 2: Typography
- [ ] Implement hero name (120px desktop / 48px mobile)
- [ ] Implement hero subtitle (36px desktop / 24px mobile)
- [ ] Set up section headers (56px desktop / 36px mobile)
- [ ] Configure body text (18px desktop / 16px mobile)
- [ ] Test typography hierarchy on both devices

### Phase 3: Spacing
- [ ] Hero section: 120px padding desktop / 80px mobile
- [ ] Section spacing: 128px desktop / 64px mobile
- [ ] Card padding: 48px desktop / 32px mobile
- [ ] Card grid gaps: 48px desktop / 24px mobile
- [ ] Test all spacing on mobile and desktop

### Phase 4: Glassmorphism Components
- [ ] Build primary glass button
- [ ] Build secondary glass button
- [ ] Create glass card component
- [ ] Build glass input fields
- [ ] Create glass navigation bar
- [ ] Test backdrop blur on different browsers

### Phase 5: Motion & Animation
- [ ] Implement hero entrance animations
- [ ] Add hover states to all interactive elements
- [ ] Create wave line animations
- [ ] Add card entrance on scroll
- [ ] Implement reduced motion support
- [ ] Test animations on mobile

### Phase 6: Accessibility
- [ ] Ensure all focus states are visible
- [ ] Add skip-to-main-content link
- [ ] Test keyboard navigation
- [ ] Verify color contrast (WCAG AA: 4.5:1)
- [ ] Test with screen reader
- [ ] Implement reduced motion support

### Phase 7: Final Polish
- [ ] Test on real mobile devices
- [ ] Optimize glassmorphism performance
- [ ] Fine-tune animation timing
- [ ] Cross-browser testing
- [ ] Performance audit

---

## 10. Notes for AI Coding Agents

**Critical Implementation Points:**

1. **Typography Scale is MUCH Larger**
   - Hero name: 120px desktop minimum
   - Don't be conservative with sizing
   - Use exact pixel values provided

2. **Spacing is VERY Generous**
   - 48px card padding on desktop
   - 48px gaps between cards
   - 128px section padding
   - More space = more professional

3. **Glassmorphism Essentials**
   - Always include `backdrop-filter` AND `-webkit-backdrop-filter`
   - Use semi-transparent backgrounds (10-20% opacity)
   - Add subtle borders with `rgba(255, 255, 255, 0.3)`
   - Include light reflection with inset box-shadows

4. **Mobile-First Approach**
   - Build mobile styles first
   - Use media queries to enhance for desktop
   - Test on actual devices, not just DevTools

5. **Browser Compatibility**
   - Backdrop-filter requires webkit prefix for Safari
   - Test glassmorphism on Firefox (may need fallbacks)
   - Provide solid background fallback for older browsers

**Common Pitfalls to Avoid:**
- ❌ Making text too small (err on the side of larger)
- ❌ Not enough spacing (always add more than you think)
- ❌ Forgetting `-webkit-backdrop-filter` prefix for glass elements
- ❌ Using glassmorphism for buttons (use solid outline style instead)
- ❌ Skipping mobile testing
- ❌ Over-complicating glassmorphism (keep it subtle)
- ❌ Mixing button styles (all buttons should use the same outline pattern)

**Testing Checklist:**
- [ ] Text is readable from 3 feet away on desktop
- [ ] Glass effect is visible but not distracting on cards
- [ ] Buttons have clear outline borders and hover states
- [ ] Mobile layout doesn't feel cramped
- [ ] All buttons are easily tappable (44px+ touch target)
- [ ] Animations respect reduced motion preference
- [ ] Focus states are clearly visible
- [ ] Button text contrasts well in both normal and hover states

---

**Design System Version**: 2.0  
**Theme**: Cream + Purple with Glassmorphism  
**Last Updated**: Refined based on feedback  
**Key Features**: Large typography, generous spacing, liquid glass components