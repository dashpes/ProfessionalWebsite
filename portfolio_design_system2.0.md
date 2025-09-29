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

### CSS Custom Properties - CURRENT IMPLEMENTATION

**The implementation uses a mix of Tailwind CSS variables and inline styles. Here are the actual values used:**

```css
/* Tailwind CSS Variables (in globals.css) */
:root {
  --background: 47 25% 95%; /* Cream: #F5F2E8 */
  --foreground: 0 0% 16%; /* Charcoal: #2A2A2A */
  /* ... other Tailwind variables */
}

/* Wave Animation Variables (in globals.css) */
:root {
  --wave-purple-light: rgba(139, 109, 184, 0.25); /* Lavender: #8B6DB8 */
  --wave-purple-medium: rgba(91, 44, 145, 0.3); /* Royal Purple: #5B2C91 */
  --wave-purple-dark: rgba(61, 27, 92, 0.35); /* Deep Plum: #3D1B5C */
  --wave-purple-subtle: rgba(91, 44, 145, 0.15); /* Royal Purple: #5B2C91 */
  --wave-cursor-glow: rgba(91, 44, 145, 0.2); /* Royal Purple: #5B2C91 */
}
```

**Direct Color Values Used in Components:**
- **Cream Background**: `#F5F2E8` (via Tailwind background)
- **Purple Primary**: `#5B2C91` (inline styles)
- **Charcoal Text**: `#2A2A2A` (inline styles)
- **Slate Secondary**: `#6B6B6B` (inline styles)
- **Glass Background**: `rgba(255, 255, 255, 0.15)` (inline styles)
- **Glass Border**: `rgba(255, 255, 255, 0.3)` (inline styles)
- **Card Shadow**: `rgba(91, 44, 145, 0.08)` (inline styles)

**Implementation Approach:**
- **Layout & Spacing**: Tailwind classes
- **Colors**: Mix of Tailwind variables and inline hex/rgba values
- **Glass Effects**: Inline styles for fine control
- **Animations**: Tailwind classes with custom timing

---

## 3. Typography System & Hierarchy

### Font Choices

**Primary Font: Inter**
- **Rationale**: Modern, geometric sans-serif with excellent readability. Clean and professional without being corporate.
- **Weights**: 700 (Bold), 600 (Semibold), 500 (Medium), 400 (Regular)
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

### Core Typography Pattern - CURRENT IMPLEMENTATION

**This is the exact pattern implemented and used across the website.**

#### Hero Section Typography (Actual Implementation)

**Hero Name - Large & Bold (Main Identity)**
```css
/* Tailwind Classes - ACTUAL IMPLEMENTATION */
.hero-name {
  @apply text-6xl md:text-8xl lg:text-9xl font-bold leading-tight mb-6 text-center;
  color: #2A2A2A; /* Charcoal - NOT purple for name */
}
```
**Sizes**: 60px mobile → 96px tablet → 128px desktop
**Example**: "Daniel Ashpes"

**Hero Subtitle - Medium & Semibold (Job Title)**
```css
/* Tailwind Classes - ACTUAL IMPLEMENTATION */
.hero-subtitle {
  @apply text-2xl md:text-4xl font-semibold leading-tight mb-8 text-center;
  color: #5B2C91; /* Purple Primary */
}
```
**Sizes**: 24px mobile → 36px desktop
**Example**: "Senior Software Engineer & Data Scientist"

#### Section Headers (Skills, Projects, etc.)

**Section Headline - Large & Bold**
```css
/* Tailwind Classes - ACTUAL IMPLEMENTATION */
.section-header {
  @apply text-3xl md:text-5xl font-bold text-center mb-12;
  color: #5B2C91; /* Purple Primary */
}
```
**Sizes**: 30px mobile → 48px desktop
**Examples**: "My Expertise", "Featured Projects"

#### Content Text Patterns

**Paragraph Text - Readable & Accessible**
```css
/* Tailwind Classes - ACTUAL IMPLEMENTATION */
.content-paragraph {
  @apply text-lg leading-relaxed text-center;
  color: #2A2A2A; /* Charcoal */
}
```
**Size**: 18px (text-lg)
**Example**: "Crafting technical solutions with precision engineering. Specializing in React, Next.js, Python, and data-driven applications that perform under pressure."

**Card Content Text**
```css
/* Tailwind Classes - ACTUAL IMPLEMENTATION */
.card-description {
  color: #2A2A2A; /* Charcoal */
}
.card-details {
  color: #6B6B6B; /* Slate Gray */
}
```

#### Button Group Pattern - CURRENT IMPLEMENTATION

**Three-Button Layout (Hero Section)**
```css
/* Tailwind Classes - ACTUAL IMPLEMENTATION */
.hero-button-group {
  @apply flex flex-col sm:flex-row gap-4 justify-center items-center;
}

.outline-purple-button {
  @apply border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px];
  /* All buttons use identical styling */
}
```

**Button Text Examples (Actual Implementation)**:
- "View My Work" → Links to `/projects`
- "Get to Know Me" → Links to `/about`
- "Get in Touch" → Links to `/contact`

**Note**: All buttons use identical outline style - no visual hierarchy, purely semantic differences through link destinations.

### Complete Implementation Example - HERO SECTION

**React/TSX Implementation (Actual Current Code)**:
```tsx
<section className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight mb-6" style={{color: '#2A2A2A'}}>
      Daniel Ashpes
    </h1>
    <h2 className="text-2xl md:text-4xl font-semibold leading-tight mb-8" style={{color: '#5B2C91'}}>
      Senior Software Engineer & Data Scientist
    </h2>
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Link href="/projects">
        <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
          View My Work
        </Button>
      </Link>
      <Link href="/about">
        <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
          Get to Know Me
        </Button>
      </Link>
      <Link href="/contact">
        <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]">
          Get in Touch
        </Button>
      </Link>
    </div>
  </div>
</section>
```

### Content Section Pattern - TYPEWRITER IMPLEMENTATION

**React/TSX Implementation (Actual Current Code)**:
```tsx
<section className="container mx-auto px-4 py-16 md:py-24 flex flex-col justify-center items-center">
  <div className="w-full max-w-4xl mx-auto text-center">
    <p className="text-lg leading-relaxed" style={{color: '#2A2A2A'}}>
      {displayedParagraph}
      {/* Typewriter cursor animation */}
    </p>
  </div>
</section>
```
**Note**: Content section uses scroll-triggered typewriter animation rather than static text + buttons pattern.

### Typography Color Specifications - CURRENT IMPLEMENTATION

**Primary Colors for Text (Actual Usage)**:
- **Hero Name**: `#2A2A2A` (Charcoal) - Personal identity in neutral tone
- **Section Headlines**: `#5B2C91` (Purple Primary) - Commands attention for sections
- **Hero Subtitle**: `#5B2C91` (Purple Primary) - Professional title emphasis
- **Body Text**: `#2A2A2A` (Charcoal) - Maximum readability
- **Secondary Text**: `#6B6B6B` (Slate) - For metadata/captions in cards

**Color Hierarchy Logic**:
1. **Charcoal** for personal name (neutral, authoritative)
2. **Purple** for professional titles and section headers (brand emphasis)
3. **Charcoal** for body content (readability)
4. **Slate** for supporting details (visual hierarchy)

### Design Principles Applied

1. **Readable First**: Text sizes are generous and prioritize readability over design system theory
2. **Clear Hierarchy**: Purple headlines create clear visual hierarchy
3. **Accessible Contrast**: Charcoal text ensures readability on cream background
4. **Functional Buttons**: Solid outline style with clear borders and hover states for maximum usability
5. **Centered Layout**: Content is centered and contained within max-width containers
6. **Responsive**: Scales appropriately on mobile while maintaining readability

### Implementation Rules for AI Agents

**CRITICAL IMPLEMENTATION RULES** (Updated to match current code):

1. **Hero Typography**:
   - Name: `text-6xl md:text-8xl lg:text-9xl font-bold` with `color: #2A2A2A`
   - Subtitle: `text-2xl md:text-4xl font-semibold` with `color: #5B2C91`

2. **Section Headers**: `text-3xl md:text-5xl font-bold` with `color: #5B2C91`

3. **Body Text**: `text-lg leading-relaxed` with `color: #2A2A2A`

4. **Buttons**: Always use outline style with `border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]`

5. **Spacing**: Use `py-16 md:py-24` for sections, `gap-4` for button groups, `gap-8` for card grids

6. **Container**: Use `container mx-auto px-4` for content wrapping

7. **Cards**: Use glassmorphism with `rgba(255, 255, 255, 0.15)` background and `backdrop-filter: blur(12px)`

**Do NOT**:
- Use glassmorphism button styles (use solid outline buttons instead)
- Use gradient text effects
- Use gray text that's hard to read
- Create text smaller than `text-lg` for body copy
- Forget button minimum widths
- Mix button styles (all buttons should use the same outline pattern)
- Use static text where typewriter animations are expected

---

## Typewriter Animation Pattern - CURRENT IMPLEMENTATION

### Content Section Typewriter Effect

The content section uses a scroll-triggered typewriter animation that types out the description text when the section comes into view.

**Key Features:**
- Intersection Observer triggers animation at 30% visibility
- Session storage prevents re-animation on subsequent scrolls
- Blinking cursor effect during typing
- Configurable typing speed

**React Implementation Pattern:**
```tsx
const [displayedParagraph, setDisplayedParagraph] = useState("")
const [showCursor, setShowCursor] = useState(true)
const [currentPhase, setCurrentPhase] = useState("waiting")

// Typewriter function
const typeText = (text: string, setter: (value: string) => void, delay: number = 30) => {
  return new Promise<void>((resolve) => {
    let index = 0
    const timer = setInterval(() => {
      setter(text.slice(0, index + 1))
      index++
      if (index >= text.length) {
        clearInterval(timer)
        resolve()
      }
    }, delay)
  })
}

// Usage in JSX
<p className="text-lg leading-relaxed" style={{color: '#2A2A2A'}}>
  {displayedParagraph}
  {getCursorPosition() === "paragraph" && (
    <span className={`inline-block w-1 h-5 md:h-6 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
          style={{backgroundColor: '#2A2A2A'}} />
  )}
</p>
```

**Animation Specifications:**
- **Typing Speed**: 20ms delay between characters for paragraph
- **Cursor Blink**: 500ms interval
- **Trigger**: 30% intersection with -100px rootMargin
- **Session Persistence**: Uses sessionStorage to prevent re-animation

**Visual Specifications:**
- **Cursor Size**: `w-1 h-5 md:h-6` (4px width, 20px/24px height)
- **Cursor Color**: Matches text color `#2A2A2A`
- **Text Content**: "Crafting technical solutions with precision engineering..."

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

### Component Spacing - CURRENT IMPLEMENTATION

**Hero Section Layout**

```css
/* Tailwind: flex items-center justify-center min-h-screen */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Note: No explicit padding - relies on natural spacing */
}
```

---

**Section Spacing (Skills, Projects, Content)**

**Tailwind Implementation:**
```css
/* Tailwind: py-16 md:py-24 px-4 */
.section {
  padding: 4rem 1rem; /* 64px vertical, 16px horizontal */
}

@media (min-width: 768px) {
  .section {
    padding: 6rem 1rem; /* 96px vertical, 16px horizontal */
  }
}
```
**Actual Values**: 64px mobile → 96px desktop (vertical)

---

**Card Grid Spacing**

**Tailwind Implementation:**
```css
/* Skills: grid gap-8 (2rem = 32px) */
/* Projects: grid gap-8 (2rem = 32px) */
.card-grid {
  gap: 2rem; /* 32px between cards */
}
```
**Actual Values**: 32px gap between cards

---

**Hero Element Spacing (Current Implementation)**

```css
/* Tailwind: mb-6, mb-8 */
.hero-name {
  margin-bottom: 1.5rem; /* 24px - mb-6 */
}

.hero-subtitle {
  margin-bottom: 2rem; /* 32px - mb-8 */
}

.hero-button-group {
  gap: 1rem; /* 16px - gap-4 */
}
```
**Actual Values**: 24px, 32px, 16px respectively

---

**Section Header Spacing**

```css
/* Tailwind: mb-12 */
.section-header {
  margin-bottom: 3rem; /* 48px */
}
```
**Actual Values**: 48px margin below section headers

---

**Container Spacing**

```css
/* Tailwind: container mx-auto px-4 */
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem; /* 16px horizontal */
}

/* Responsive container max-widths are handled by Tailwind automatically */
```
**Actual Values**: 16px horizontal padding on all screen sizes

---

### Grid System - CURRENT IMPLEMENTATION

**Tailwind Container System (Actual Implementation)**
```css
/* Tailwind: container mx-auto px-4 */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem; /* 16px horizontal padding */
}

/* Tailwind responsive breakpoints */
@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
@media (min-width: 1536px) { .container { max-width: 1536px; } }
```

**Card Grid Implementations (Actual)**

**Skills Section:**
```css
/* Tailwind: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 */
.skills-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
  gap: 2rem; /* 32px */
}
@media (min-width: 768px) {
  .skills-grid { grid-template-columns: repeat(2, 1fr); } /* Tablet: 2 columns */
}
@media (min-width: 1024px) {
  .skills-grid { grid-template-columns: repeat(4, 1fr); } /* Desktop: 4 columns */
}
```

**Projects Section:**
```css
/* Tailwind: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 */
.projects-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
  gap: 2rem; /* 32px */
}
@media (min-width: 768px) {
  .projects-grid { grid-template-columns: repeat(2, 1fr); } /* Tablet: 2 columns */
}
@media (min-width: 1024px) {
  .projects-grid { grid-template-columns: repeat(3, 1fr); } /* Desktop: 3 columns */
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

### Button Components - CURRENT IMPLEMENTATION

All buttons use consistent outline styling with purple borders and hover effects. No glassmorphism is used for buttons to maintain usability and accessibility.

**Standard Button Pattern (Actual Implementation)**

```tsx
// React Component Implementation (using Shadcn/UI Button)
<Link href="/destination">
  <Button
    size="lg"
    variant="outline"
    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent transition-all duration-300 min-w-[160px]"
  >
    Button Text
  </Button>
</Link>
```

**Button Variants Used:**

1. **Hero Buttons**: All three use identical outline styling
2. **Project GitHub Buttons**: Same outline style
3. **Project Live Demo Buttons**: Uses `bg-purple-600 hover:bg-purple-700 text-white` (filled style)
4. **View All Projects Button**: Uses outline style

**Note**: Live demo buttons are the only exception using filled purple background for primary action emphasis.

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

### Glass Card Component - CURRENT IMPLEMENTATION

**Cards are implemented using inline styles for glassmorphism effects with Tailwind for layout.**

**Skills/Projects Card Pattern (Actual Implementation):**
```tsx
<Card
  className="border transition-all duration-700 ease-out"
  style={{
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
  }}
>
  <CardHeader className="flex flex-col items-center text-center">
    {skill.icon}
    <CardTitle className="mt-4 text-xl" style={{ color: '#2A2A2A' }}>
      {skill.title}
    </CardTitle>
  </CardHeader>
  <CardContent className="text-center">
    <p className="mb-4" style={{ color: '#2A2A2A' }}>
      {skill.description}
    </p>
    <ul className="list-disc list-inside text-left inline-block" style={{ color: '#6B6B6B' }}>
      {skill.details.map((detail, i) => (
        <li key={i}>{detail}</li>
      ))}
    </ul>
  </CardContent>
</Card>
```

**Glass Effect Specifications (Actual Values):**
- **Background**: `rgba(255, 255, 255, 0.15)` (15% white opacity)
- **Backdrop Blur**: `12px` (with webkit prefix)
- **Border**: `1px solid rgba(255, 255, 255, 0.3)` (30% white opacity)
- **Border Radius**: `20px`
- **Shadow**: `0 8px 32px rgba(91, 44, 145, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)`

**Animation Effects:**
- **Scroll-triggered entrance**: Cards animate in with staggered delays
- **Transform**: `opacity-0 transform -translate-x-12 scale-95` → `opacity-100 transform translate-x-0 scale-100`
- **Duration**: `duration-700 ease-out`
- **Stagger Delay**: 200ms for skills, 250ms for projects

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

### Phase 2: Typography ✅ COMPLETE
- [x] Implement hero name (`text-6xl md:text-8xl lg:text-9xl` - 60px/96px/128px)
- [x] Implement hero subtitle (`text-2xl md:text-4xl` - 24px/36px)
- [x] Set up section headers (`text-3xl md:text-5xl` - 30px/48px)
- [x] Configure body text (`text-lg` - 18px)
- [x] Test typography hierarchy on both devices

### Phase 3: Spacing ✅ COMPLETE
- [x] Hero section: Natural flex centering (no explicit padding)
- [x] Section spacing: `py-16 md:py-24` (64px/96px vertical)
- [x] Container padding: `px-4` (16px horizontal)
- [x] Card grid gaps: `gap-8` (32px)
- [x] Test all spacing on mobile and desktop

### Phase 4: Components ✅ COMPLETE
- [x] Outline button pattern (no glass - better usability)
- [x] Glass card components for skills/projects
- [x] Navigation dropdown component
- [x] Typewriter animation component
- [x] Global waves background
- [x] Test backdrop blur across browsers

### Phase 5: Motion & Animation ✅ COMPLETE
- [x] Implement hero typewriter animations
- [x] Add content section typewriter effect
- [x] Create GlobalWavesBackground component
- [x] Add scroll-triggered card entrance animations
- [x] Implement staggered animation delays
- [x] Add session storage animation prevention
- [x] Implement reduced motion support
- [x] Test animations on mobile

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

## 10. Notes for AI Coding Agents - CURRENT IMPLEMENTATION

**Critical Implementation Points (Updated to Match Current Code):**

1. **Typography Scale (Actual Sizes)**
   - Hero name: `text-6xl md:text-8xl lg:text-9xl` (60px → 96px → 128px)
   - Hero subtitle: `text-2xl md:text-4xl` (24px → 36px)
   - Section headers: `text-3xl md:text-5xl` (30px → 48px)
   - Body text: `text-lg` (18px)

2. **Spacing (Actual Values)**
   - Section padding: `py-16 md:py-24` (64px → 96px vertical)
   - Container padding: `px-4` (16px horizontal)
   - Card gaps: `gap-8` (32px between cards)
   - Button gaps: `gap-4` (16px between buttons)

3. **Color Implementation Approach**
   - Use inline `style={{color: '#HEX'}}` for text colors
   - Use Tailwind classes for layout and spacing
   - Use inline styles for glassmorphism effects
   - Maintain color consistency: Purple `#5B2C91`, Charcoal `#2A2A2A`, Slate `#6B6B6B`

4. **Glassmorphism Implementation**
   - Always use inline styles for glass effects
   - Standard values: `rgba(255, 255, 255, 0.15)` background
   - Always include both `backdropFilter` and `WebkitBackdropFilter`
   - Border: `rgba(255, 255, 255, 0.3)`, Blur: `12px`

5. **Animation Patterns**
   - Use Intersection Observer for scroll-triggered animations
   - Session storage to prevent re-animation
   - Staggered delays for card entrances
   - Typewriter effect for content sections

6. **Button Consistency**
   - All standard buttons: `border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white`
   - Exception: Live demo buttons use filled purple background
   - Always include `min-w-[160px]` and `transition-all duration-300`

**Common Pitfalls to Avoid (Updated for Current Implementation):**
- ❌ Using different typography sizes than documented (stick to current Tailwind classes)
- ❌ Forgetting inline color styles (don't rely only on Tailwind for brand colors)
- ❌ Forgetting `-webkit-backdrop-filter` prefix for glass elements
- ❌ Using glassmorphism for buttons (use solid outline style instead)
- ❌ Missing session storage for preventing animation re-triggers
- ❌ Inconsistent button styling (stick to documented pattern)
- ❌ Using CSS custom properties where inline styles are expected
- ❌ Forgetting to wrap buttons in Link components for navigation
- ❌ Missing staggered animation delays for card entrances

**Testing Checklist (Updated for Current Implementation):**
- [ ] Hero name scales properly: 60px → 96px → 128px across breakpoints
- [ ] Typewriter animation triggers at correct scroll position (30% visibility)
- [ ] Glass cards have proper backdrop blur and transparency
- [ ] All buttons use consistent purple outline styling
- [ ] Card animations have proper staggered delays (200ms skills, 250ms projects)
- [ ] Session storage prevents animation re-triggering
- [ ] Color contrast meets accessibility standards
- [ ] All navigation buttons properly link to their destinations
- [ ] Mobile layout maintains readability and touch targets
- [ ] Reduced motion preference is respected

---

**Design System Version**: 2.1
**Theme**: Cream + Purple with Glassmorphism
**Last Updated**: Updated to match current implementation exactly
**Key Features**: Responsive typography scale, typewriter animations, glassmorphism cards, consistent button patterns
**Implementation**: Tailwind CSS + inline styles + React animations

**Status**: ✅ **SYNCHRONIZED** - Documentation now matches current implementation exactly