# LawonBloom Architecture & Design System

This document outlines the professional architecture and design standards established for the LawonBloom project.

## 1. Routing & Architecture

The application is built on the **Next.js App Router** with a strict colocation pattern. The structure is fully lowercase and follows standard kebab-case naming for compound routes.

### App Router Structure
- `/` - Landing Page
- `/about` - Our Story & History
- `/faq` - Patient Inquiries
- `/sanctuary` - Sanctuary Overview
  - `/sanctuary/services` - Specific Clinical Services
- `/journey` - The Patient Journey Timeline
  - `/journey/consultation` - Initial Consultation & Booking
  - `/journey/stories` - Patient Testimonials

### Component Colocation
To maintain a professional and scalable structure, components are grouped into folders that **mirror the routing structure**. This makes it incredibly easy to find the components responsible for a specific page.

```text
components/
├── about/                  # Used in /about
├── journey/                # Used in /journey
│   ├── consultation/       # Used in /journey/consultation
│   └── stories/            # Used in /journey/stories
├── layout/                 # Global UI (Header, Footer)
└── sanctuary/              # Used in /sanctuary
    └── services/           # Used in /sanctuary/services
```

## 2. Design System & CSS Variables

The project utilizes **Tailwind CSS v4** coupled with a robust custom design system configured via CSS variables in `app/globals.css`.

### Core Concept: "Scientific Serenity"
The aesthetic is designed to feel cinematic, calming, and highly professional. We rely heavily on glassmorphism, soft gradients, and precise typography.

### Color Palette
Defined as CSS variables natively mapped to Tailwind utility classes:
- **Primary:** `#8a4853` (A soft, warm ruby hue representing life)
- **Surface:** `#fbf9f6` (A warm, serene off-white replacing pure white)
- **Foreground / On-Surface:** `#1b1c1a` (Deep espresso/charcoal for text)
- **Tertiary:** `#316462` (A clinical, calming teal for accents)

### Typography
Two primary Google Fonts are utilized via `next/font`:
1. **Newsreader** (`var(--font-newsreader)`): Used for display headers, editorial sections, and bringing a sense of heritage and authority.
2. **Manrope** (`var(--font-manrope)`): Used for body copy, labels, and UI elements.

**Typography Tokens:**
- `.font-display-hero`: 84px, lightweight display
- `.font-h1-editorial`: 48px, standard page headers
- `.font-h2-subheading`: 32px, section subheaders
- `.font-body-large`: 18px, leading paragraphs
- `.font-label-caps`: 12px, uppercase tracking for micro-copy and tags

## 3. UI Components & Utilities

Instead of writing long strings of Tailwind classes repeatedly, standard UI treatments are encapsulated into global CSS classes inside `app/globals.css`:

- `.glass-panel`: Applies a translucent, frosted glass effect with a subtle border and shadow. Ideal for cards overlaying images.
- `.cinematic-shadow`: A deep, soft shadow used for large imagery.
- `.grain-overlay`: A subtle SVG noise filter overlay applied to full-page sections to give an editorial, film-like texture.
- `.elegant-divider`: A horizontal rule using a soft gradient fading into transparency on both edges.
- `.bento-card` & `.bento-bg-reveal`: Interactive cards used for the services grid, featuring smooth hover animations that reveal background imagery.

## 4. Best Practices for Future Development

1. **New Pages:** Always use lowercase folder names in the `app/` directory.
2. **New Components:** If a component is specific to a page, create a subfolder in `components/` matching its exact path in the `app/` directory. If it is reused across multiple unrelated pages, place it in `components/ui/` or `components/layout/`.
3. **Icons:** Stick strictly to `lucide-react`. Avoid introducing additional icon libraries (like Material Symbols) to minimize bundle size.
4. **Spacing:** Maintain rhythm using Tailwind's layout tools. The global `.max-w-360` class perfectly restrains content to 1440px on extra-large displays.
