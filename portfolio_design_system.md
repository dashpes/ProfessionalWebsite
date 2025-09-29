# Portfolio Website Design System
**Senior UI/UX Engineer - Design Guidelines v1.0**

---

## 1. Design Philosophy & Brand Direction

Drawing from gorpcore aesthetics (Arc'teryx, Mountain Hardwear, Patagonia), we're building a design system that embodies:

- **Technical precision** - Clean, functional interfaces that prioritize usability
- **Premium materiality** - Subtle textures and depth that suggest quality craftsmanship
- **Performance-driven** - Every element serves a purpose, no decoration for decoration's sake
- **Adventurous minimalism** - Bold enough to stand out, refined enough to remain timeless

The cream and purple palette creates an unexpected sophistication—moving away from the typical dark portfolio while maintaining serious, professional credibility.

---

## 2. Color Palette & Psychological Reasoning

### Primary Colors

**Royal Purple (Primary Action)**
- Hex: `#5B2C91` - Deep Royal Purple
- **Psychology**: Conveys creativity, wisdom, and premium quality. Associated with innovation and high-end brands. This richness commands attention without aggression.
- **Usage**: CTAs, interactive elements, hover states, accent highlights

**Cream (Base)**
- Hex: `#F5F2E8` - Warm Cream
- **Psychology**: Calming, sophisticated, reduces eye strain. Creates breathing room and suggests thoughtfulness. More inviting than stark white while maintaining professionalism.
- **Usage**: Primary background, card backgrounds, content areas

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

### Accent & Utility Colors

**Warm Beige (Elevated Surfaces)**
- Hex: `#E8E3D5` - Warm Beige
- **Psychology**: Subtle elevation, creates hierarchy without stark contrast.
- **Usage**: Card elevation, section breaks, subtle backgrounds

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

### Quick Reference Color Variables

```css
/* Primary Colors */
--color-purple-primary: #5B2C91;
--color-cream-base: #F5F2E8;

/* Secondary Colors */
--color-charcoal: #2A2A2A;
--color-slate: #6B6B6B;
--color-lavender: #8B6DB8;
--color-plum: #3D1B5C;

/* Accent Colors */
--color-beige: #E8E3D5;
--color-success: #3D7C5B;
--color-alert: #C16B4F;
--color-error: #8B3A3A;
```

---

## 3. Typography System & Hierarchy

### Font Choices

**Display/Heading Font: Inter**
- **Rationale**: Modern, geometric sans-serif used by technical brands. Excellent legibility across sizes. Professional without being corporate. Strong character at display sizes.
- **Weights**: 700 (Bold), 600 (Semibold)
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

**Body/UI Font: Inter**
- **Rationale**: Maintaining Inter throughout creates cohesion while its extensive weight range provides flexibility. Designed specifically for screens with excellent readability at small sizes.
- **Weights**: 400 (Regular), 500 (Medium)

**Accent/Monospace: JetBrains Mono**
- **Rationale**: For code snippets, technical details, or special callouts. Adds technical credibility and provides visual variety. Clean, modern monospace.
- **Weight**: 400 (Regular)
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap');`

### Hierarchy Rules

**H1 - Hero/Page Title**
```css
font-family: 'Inter', sans-serif;
font-weight: 700;
font-size: 64px; /* 4rem */
line-height: 1.1;
letter-spacing: -0.02em;
color: #2A2A2A;
```
- **Usage**: Primary page headline, hero statements

**H2 - Section Headers**
```css
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 48px; /* 3rem */
line-height: 1.2;
letter-spacing: -0.01em;
color: #2A2A2A;
```
- **Usage**: Major section breaks

**H3 - Subsection Headers**
```css
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 32px; /* 2rem */
line-height: 1.3;
letter-spacing: -0.01em;
color: #2A2A2A;
```
- **Usage**: Content groupings, card titles

**H4 - Component Headers**
```css
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 24px; /* 1.5rem */
line-height: 1.4;
letter-spacing: 0;
color: #2A2A2A;
```
- **Usage**: Small component titles, list headers

**Body Large**
```css
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 20px; /* 1.25rem */
line-height: 1.6;
letter-spacing: 0;
color: #2A2A2A;
```
- **Usage**: Intro paragraphs, emphasis content

**Body Regular**
```css
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 16px; /* 1rem */
line-height: 1.7;
letter-spacing: 0;
color: #2A2A2A;
```
- **Usage**: Standard body copy, descriptions

**Body Small**
```css
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 14px; /* 0.875rem */
line-height: 1.6;
letter-spacing: 0;
color: #6B6B6B;
```
- **Usage**: Captions, metadata, secondary info

**Label/UI Text**
```css
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 14px; /* 0.875rem */
line-height: 1.4;
letter-spacing: 0.01em;
text-transform: uppercase;
color: #2A2A2A;
```
- **Usage**: Button labels, form labels, navigation

**Code/Technical**
```css
font-family: 'JetBrains Mono', monospace;
font-weight: 400;
font-size: 14px; /* 0.875rem */
line-height: 1.5;
letter-spacing: 0;
color: #5B2C91;
background-color: #E8E3D5;
padding: 2px 6px;
border-radius: 4px;
```
- **Usage**: Inline code, technical specifications

### CSS Custom Properties for Typography

```css
:root {
  /* Font Families */
  --font-primary: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Font Sizes */
  --text-h1: 4rem;      /* 64px */
  --text-h2: 3rem;      /* 48px */
  --text-h3: 2rem;      /* 32px */
  --text-h4: 1.5rem;    /* 24px */
  --text-lg: 1.25rem;   /* 20px */
  --text-base: 1rem;    /* 16px */
  --text-sm: 0.875rem;  /* 14px */
  
  /* Font Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.1;
  --leading-snug: 1.2;
  --leading-normal: 1.3;
  --leading-relaxed: 1.4;
  --leading-loose: 1.6;
  --leading-extra: 1.7;
}
```

---

## 4. Spacing System & Grid Approach

### Spacing Scale (8px Base Unit)

Using an 8-point grid system for consistency and mathematical harmony:

```css
:root {
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

### Application Rules

**Component Internal Spacing**
- Button padding: `var(--space-sm)` vertical, `var(--space-md)` horizontal (16px/24px)
- Card padding: `var(--space-lg)` all sides (32px)
- Input padding: `var(--space-sm)` vertical, `var(--space-md)` horizontal (16px/24px)
- Section padding: `var(--space-2xl)` vertical (64px)

**Vertical Rhythm**
- Paragraph spacing: `var(--space-md)` (24px)
- Section spacing: `var(--space-3xl)` (96px)
- Component spacing within sections: `var(--space-xl)` (48px)
- Related element spacing: `var(--space-sm)` to `var(--space-md)` (16-24px)

**Horizontal Spacing**
- Button groups: `var(--space-sm)` gap (16px)
- Navigation items: `var(--space-md)` gap (24px)
- Card grids: `var(--space-lg)` gap (32px)

### Grid System

**Desktop (1440px max-width container)**
```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 5rem; /* 80px outer margins */
}

.grid-desktop {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-lg); /* 32px */
}
```
- Breakpoint: `1024px+`

**Tablet (768px - 1023px)**
```css
@media (max-width: 1023px) and (min-width: 768px) {
  .container {
    padding: 0 3rem; /* 48px outer margins */
  }
  
  .grid-tablet {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--space-md); /* 24px */
  }
}
```

**Mobile (< 768px)**
```css
@media (max-width: 767px) {
  .container {
    padding: 0 1.5rem; /* 24px outer margins */
  }
  
  .grid-mobile {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-sm); /* 16px */
  }
}
```

### Layout Patterns

**Full-Bleed Sections**
```css
.section-full-bleed {
  width: 100%;
  padding: var(--space-3xl) 0; /* 96px vertical */
}

.section-full-bleed .container {
  max-width: 1440px;
  margin: 0 auto;
}
```
- Use for: Hero sections, major section breaks

**Contained Sections**
```css
.section-contained {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-xl);
}
```
- Use for: Body content, cards, text-heavy areas

**Asymmetric Layouts**
```css
.layout-asymmetric {
  display: grid;
  grid-template-columns: 3fr 2fr; /* 60/40 split */
  gap: var(--space-xl);
}

.layout-asymmetric-alt {
  display: grid;
  grid-template-columns: 7fr 3fr; /* 70/30 split */
  gap: var(--space-xl);
}
```
- Use for: Image/content splits, featured content

---

## 5. Motion Principles & Interaction Guidelines

### Core Philosophy

Motion should feel **purposeful and physical**—inspired by the precision engineering of outdoor gear. Every animation should provide feedback, guide attention, or reveal hierarchy. Nothing moves without reason.

### Timing & Easing

**Speed Tokens**
```css
:root {
  --duration-instant: 100ms;   /* Micro-interactions, hover acknowledgments */
  --duration-fast: 200ms;      /* State changes, simple transitions */
  --duration-base: 300ms;      /* Standard animations, page transitions */
  --duration-slow: 500ms;      /* Complex animations, page loads */
  --duration-deliberate: 700ms; /* Dramatic reveals, hero elements */
}
```

**Easing Functions**

```css
:root {
  /* Primary - Sharp start, smooth landing */
  --ease-out-expo: cubic-bezier(0.4, 0.0, 0.2, 1);
  
  /* Secondary - Gentle acceleration and deceleration */
  --ease-in-out: cubic-bezier(0.25, 0.1, 0.25, 1);
  
  /* Bouncy - Slight overshoot for personality (use sparingly) */
  --ease-back-out: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Easing Usage Guide:**
- `--ease-out-expo`: Dropdowns, modals, cards entering, most UI elements
- `--ease-in-out`: Page transitions, large movements, smooth interactions
- `--ease-back-out`: CTAs, success states, special moments (use sparingly)

### Animation Patterns

**1. Hover States (Instant - 100ms)**

```css
/* Default Button → Hover */
.btn-primary {
  background-color: var(--color-purple-primary);
  color: var(--color-cream-base);
  transform: scale(1);
  box-shadow: none;
  transition: all var(--duration-instant) ease-out;
}

.btn-primary:hover {
  background-color: var(--color-lavender);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(91, 44, 145, 0.2);
}

/* Text Links */
.text-link {
  color: var(--color-charcoal);
  text-decoration: underline 1px;
  transition: all var(--duration-instant) linear;
}

.text-link:hover {
  color: var(--color-purple-primary);
  text-decoration: underline 2px;
}
```

**2. Click/Active States (Instant - 100ms)**

```css
.btn-primary:active {
  transform: scale(0.98);
  transition: transform var(--duration-instant) ease-in;
}
```

**3. Focus States (Fast - 200ms)**

```css
.input-field {
  border: 2px solid var(--color-beige);
  box-shadow: none;
  transition: all var(--duration-fast) var(--ease-out-expo);
}

.input-field:focus {
  border-color: var(--color-purple-primary);
  box-shadow: 0 0 0 4px rgba(91, 44, 145, 0.1);
  outline: none;
}
```

**4. Wave Lines (Base - 300ms)**

```css
/* Background Wave Animation */
.wave-line {
  animation: waveMotion 3s var(--ease-in-out) infinite;
}

@keyframes waveMotion {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.wave-line:nth-child(2) {
  animation-delay: 100ms;
}

.wave-line:nth-child(3) {
  animation-delay: 200ms;
}

/* Parallax on scroll (implement with JS) */
.wave-container {
  /* Waves move at 0.3x scroll speed for depth */
}
```

**5. Card Entry (Base - 300ms)**

```css
/* Card Reveal (on scroll into viewport) */
.card {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity var(--duration-base) var(--ease-out-expo),
              transform var(--duration-base) var(--ease-out-expo);
}

.card.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger delay between cards */
.card:nth-child(1) { transition-delay: 0ms; }
.card:nth-child(2) { transition-delay: 100ms; }
.card:nth-child(3) { transition-delay: 200ms; }
.card:nth-child(4) { transition-delay: 300ms; }
.card:nth-child(5) { transition-delay: 400ms; }
```

**6. Modal/Dialog (Slow - 500ms)**

```css
/* Modal Open */
.modal-backdrop {
  opacity: 0;
  backdrop-filter: blur(0px);
  transition: opacity var(--duration-base),
              backdrop-filter var(--duration-slow);
}

.modal-backdrop.open {
  opacity: 1;
  backdrop-filter: blur(8px);
}

.modal-content {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity var(--duration-slow) var(--ease-out-expo),
              transform var(--duration-slow) var(--ease-out-expo);
}

.modal-content.open {
  opacity: 1;
  transform: scale(1);
}
```

**7. Page Transitions (Slow - 500ms)**

```css
/* Page Exit */
.page-exit {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-base),
              transform var(--duration-base);
}

.page-exit.active {
  opacity: 0;
  transform: translateY(-20px);
}

/* Page Enter */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter.active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-slow) var(--ease-out-expo),
              transform var(--duration-slow) var(--ease-out-expo);
}
```

**8. Navigation Highlighting (Fast - 200ms)**

```css
.nav-indicator {
  position: absolute;
  bottom: 0;
  height: 3px;
  background-color: var(--color-purple-primary);
  transition: transform var(--duration-fast) var(--ease-out-expo),
              width var(--duration-fast) var(--ease-out-expo);
}
```

**9. Loading States (Base - 300ms)**

```css
/* Skeleton Screens - Pulse Animation */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-beige) 0%,
    var(--color-cream-base) 50%,
    var(--color-beige) 100%
  );
  background-size: 200% 100%;
  animation: pulse 1500ms ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Loading Spinner */
.spinner {
  border: 3px solid var(--color-beige);
  border-top-color: var(--color-purple-primary);
  border-radius: 50%;
  animation: spin 1000ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

**10. Scroll Reveals (Deliberate - 700ms)**

```css
/* Hero Text Reveal (on page load) */
.hero-text {
  opacity: 0;
  transform: translateY(20px);
}

.hero-text.reveal {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-deliberate) var(--ease-out-expo),
              transform var(--duration-deliberate) var(--ease-out-expo);
}

/* Stagger characters/words (implement with JS) */
.hero-text span:nth-child(1) { transition-delay: 0ms; }
.hero-text span:nth-child(2) { transition-delay: 30ms; }
.hero-text span:nth-child(3) { transition-delay: 60ms; }
/* Continue pattern... */
```

### Interaction States Matrix

| Element | Default | Hover | Active | Focus | Disabled |
|---------|---------|-------|--------|-------|----------|
| **Primary Button** | Purple bg, cream text | Lavender bg, scale 1.02, shadow | Scale 0.98 | Purple border + glow | 40% opacity, no pointer |
| **Secondary Button** | Cream bg, purple border | Purple bg, cream text | Scale 0.98 | Purple glow | 40% opacity |
| **Text Link** | Charcoal | Purple, 2px underline | Purple | Purple + underline | Gray, no underline |
| **Card** | Flat, subtle shadow | Elevated shadow, -2px Y | N/A | Purple border | N/A |
| **Input** | Beige bg, thin border | Thin purple border | N/A | Thick purple border + glow | Gray bg, 60% opacity |

```css
/* Quick Reference: Component States */

/* Primary Button States */
.btn-primary {
  background: var(--color-purple-primary);
  color: var(--color-cream-base);
}
.btn-primary:hover {
  background: var(--color-lavender);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(91, 44, 145, 0.2);
}
.btn-primary:active {
  transform: scale(0.98);
}
.btn-primary:focus-visible {
  outline: 2px solid var(--color-purple-primary);
  outline-offset: 2px;
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Secondary Button States */
.btn-secondary {
  background: var(--color-cream-base);
  border: 2px solid var(--color-purple-primary);
  color: var(--color-purple-primary);
}
.btn-secondary:hover {
  background: var(--color-purple-primary);
  color: var(--color-cream-base);
}
.btn-secondary:active {
  transform: scale(0.98);
}
.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Card States */
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all var(--duration-fast) var(--ease-out-expo);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(91, 44, 145, 0.12);
}
.card:focus-within {
  outline: 2px solid var(--color-purple-primary);
  outline-offset: 2px;
}

/* Input States */
.input {
  background: var(--color-beige);
  border: 2px solid var(--color-beige);
}
.input:hover {
  border-color: var(--color-purple-primary);
}
.input:focus {
  border-color: var(--color-purple-primary);
  box-shadow: 0 0 0 4px rgba(91, 44, 145, 0.1);
}
.input:disabled {
  background: var(--color-slate);
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Micro-Interactions

**Success Confirmation**
```css
.success-icon {
  animation: successPop 500ms var(--ease-back-out);
}

@keyframes successPop {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.success-bg {
  animation: successFlash 500ms ease-out;
}

@keyframes successFlash {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--color-success);
  }
}
```

**Error Shake**
```css
.error-shake {
  animation: shake 400ms ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.error-pulse {
  animation: errorPulse 400ms ease-out;
}

@keyframes errorPulse {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--color-error);
  }
}
```

**Copy to Clipboard**
```css
/* Button text changes instantly */
.copy-btn[data-copied="true"] .copy-text {
  display: none;
}

.copy-btn[data-copied="true"] .copied-text {
  display: inline;
}

/* Icon crossfade */
.copy-icon {
  transition: opacity var(--duration-fast);
}

.copy-btn[data-copied="true"] .copy-icon {
  opacity: 0;
}

.copied-icon {
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.copy-btn[data-copied="true"] .copied-icon {
  opacity: 1;
}
```

### Performance Guidelines

- **Use GPU-accelerated properties only**: `transform` and `opacity`
- **Avoid animating**: `width`, `height`, `margin`, `padding`, `top`, `left`
- **Use `will-change` sparingly**: Only on actively animating elements, remove after animation
  ```css
  .animating-element {
    will-change: transform, opacity;
  }
  
  .animating-element.animation-complete {
    will-change: auto; /* Remove after animation */
  }
  ```
- **Maximum simultaneous animations**: 3-4 elements on mobile, 6-8 on desktop
- **Respect reduced motion**: Always include reduced motion support

### Accessibility Considerations

```css
/* Reduced Motion Support - CRITICAL */
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

/* All interactive elements MUST have visible focus states */
:focus-visible {
  outline: 2px solid var(--color-purple-primary);
  outline-offset: 2px;
}

/* Skip to main content for keyboard users */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-purple-primary);
  color: var(--color-cream-base);
  padding: var(--space-sm) var(--space-md);
  z-index: 100;
}

.skip-to-main:focus {
  top: 0;
}
```

**Accessibility Checklist:**
- ✅ All interactive elements have visible focus states
- ✅ Animations never required to understand content
- ✅ Motion enhances but never obstructs
- ✅ Loading states have text alternatives for screen readers
- ✅ Reduced motion preference respected
- ✅ Keyboard navigation fully functional
- ✅ Color contrast meets WCAG AA standards (4.5:1 minimum)

---

## 6. Component Examples

### Primary Button Component

```css
.btn-primary {
  /* Base Styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  
  /* Typography */
  font-family: var(--font-primary);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  letter-spacing: 0.01em;
  text-transform: uppercase;
  
  /* Spacing */
  padding: var(--space-sm) var(--space-md);
  
  /* Colors */
  background-color: var(--color-purple-primary);
  color: var(--color-cream-base);
  
  /* Border & Shape */
  border: none;
  border-radius: 8px;
  
  /* Effects */
  box-shadow: none;
  cursor: pointer;
  
  /* Transitions */
  transition: all var(--duration-instant) ease-out;
  
  /* Prevent text selection */
  user-select: none;
}

.btn-primary:hover {
  background-color: var(--color-lavender);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(91, 44, 145, 0.2);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-purple-primary);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: scale(1);
}
```

### Card Component

```css
.card {
  /* Base Structure */
  display: flex;
  flex-direction: column;
  
  /* Spacing */
  padding: var(--space-lg);
  
  /* Colors */
  background-color: var(--color-cream-base);
  
  /* Border & Shape */
  border-radius: 12px;
  
  /* Effects */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  /* Transitions */
  transition: all var(--duration-fast) var(--ease-out-expo);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(91, 44, 145, 0.12);
}

.card-title {
  font-size: var(--text-h3);
  font-weight: var(--weight-semibold);
  color: var(--color-charcoal);
  margin-bottom: var(--space-md);
}

.card-content {
  font-size: var(--text-base);
  line-height: var(--leading-extra);
  color: var(--color-charcoal);
}

.card-footer {
  margin-top: auto;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-beige);
}
```

### Input Component

```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.input-label {
  font-family: var(--font-primary);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--color-charcoal);
}

.input-field {
  /* Base Styles */
  width: 100%;
  
  /* Typography */
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--color-charcoal);
  
  /* Spacing */
  padding: var(--space-sm) var(--space-md);
  
  /* Colors */
  background-color: var(--color-beige);
  
  /* Border & Shape */
  border: 2px solid var(--color-beige);
  border-radius: 8px;
  
  /* Transitions */
  transition: all var(--duration-fast) var(--ease-out-expo);
}

.input-field:hover:not(:disabled) {
  border-color: var(--color-purple-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-purple-primary);
  box-shadow: 0 0 0 4px rgba(91, 44, 145, 0.1);
  background-color: var(--color-cream-base);
}

.input-field:disabled {
  background-color: var(--color-slate);
  opacity: 0.6;
  cursor: not-allowed;
}

.input-helper {
  font-size: var(--text-sm);
  color: var(--color-slate);
}

.input-error {
  color: var(--color-error);
}
```

---

## 7. Implementation Checklist

### Setup Phase
- [ ] Import Inter font (weights: 400, 500, 600, 700)
- [ ] Import JetBrains Mono font (weight: 400)
- [ ] Define all CSS custom properties in `:root`
- [ ] Set up base font size (16px = 1rem)
- [ ] Configure box-sizing: border-box globally

### Color System
- [ ] Implement all color variables
- [ ] Test color contrast ratios (WCAG AA minimum)
- [ ] Create color utility classes
- [ ] Document color usage in comments

### Typography
- [ ] Set up all heading styles (H1-H4)
- [ ] Configure body text styles
- [ ] Implement label/UI text styles
- [ ] Create code/technical text styles
- [ ] Test typography hierarchy on mobile

### Spacing & Layout
- [ ] Implement spacing scale variables
- [ ] Set up grid system (desktop/tablet/mobile)
- [ ] Create container component
- [ ] Build layout utility classes
- [ ] Test responsive breakpoints

### Motion & Animation
- [ ] Define timing and easing variables
- [ ] Implement hover states for all interactive elements
- [ ] Add focus states for accessibility
- [ ] Create loading/skeleton states
- [ ] Build page transition system
- [ ] Add reduced motion media query
- [ ] Test animations on mobile devices

### Components
- [ ] Build primary button component
- [ ] Build secondary button component
- [ ] Create card component
- [ ] Build input/form components
- [ ] Create navigation component
- [ ] Implement wave line background
- [ ] Build modal/dialog component

### Accessibility
- [ ] Ensure all interactive elements have focus states
- [ ] Add skip-to-main-content link
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios
- [ ] Add ARIA labels where needed
- [ ] Test with screen reader
- [ ] Verify reduced motion support

### Performance
- [ ] Optimize animation performance (use transform/opacity)
- [ ] Minimize will-change usage
- [ ] Test on mobile devices
- [ ] Optimize font loading (font-display: swap)
- [ ] Lazy load non-critical animations

---

## 8. Notes for AI Agents

When implementing this design system:

1. **Always use CSS custom properties** instead of hardcoded values
2. **Maintain the 8px spacing grid** - never use arbitrary spacing values
3. **Respect the timing and easing functions** - don't create custom timings without reason
4. **Test all interactive states**: default, hover, active, focus, disabled
5. **Include reduced motion support** in every animation
6. **Use semantic HTML** - proper heading hierarchy, button vs link usage, form structure
7. **Prioritize accessibility** - keyboard navigation, screen readers, color contrast
8. **Keep motion purposeful** - every animation should serve a UX function
9. **Mobile-first approach** - build mobile styles first, enhance for desktop
10. **Performance matters** - use GPU-accelerated properties, minimize repaints

### Common Pitfalls to Avoid
- ❌ Animating width, height, or positional properties
- ❌ Using arbitrary spacing values outside the system
- ❌ Forgetting focus states on interactive elements
- ❌ Overusing will-change property
- ❌ Ignoring reduced motion preferences
- ❌ Creating overly complex animations
- ❌ Mixing px and rem units inconsistently
- ❌ Hardcoding colors instead of using variables

### When in Doubt
- Refer back to the gorpcore aesthetic: technical, premium, purposeful
- Keep it simple and functional
- Prioritize user experience over visual flourish
- Test on actual devices, not just in browser DevTools

---

**Design System Version**: 1.0  
**Last Updated**: 2025  
**Maintained By**: Senior UI/UX Engineer

This is a living document. As the portfolio evolves, update this guide to reflect new patterns, components, and decisions.