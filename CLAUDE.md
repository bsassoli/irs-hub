# IRS Hub - Project Documentation

## Overview
IRS Hub is an interactive learning platform built with Next.js 16 featuring educational probability and statistics applications. The platform provides interactive calculators and visualizations for teaching concepts like subjective probability, betting theory, and Bayesian reasoning.

## Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Fonts**:
  - Sans-serif: Nunito Sans (`--font-sans`)
  - Serif: EB Garamond (`--font-serif`)
- **Package Manager**: pnpm

## Project Structure

```
/Users/bernardino/irs-hub/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Home page (apps listing)
│   ├── globals.css             # Global styles with custom theme
│   └── apps/
│       └── [slug]/
│           └── page.tsx        # Dynamic app routes
├── components/
│   ├── ui/                     # Shadcn UI components (Button, Card, Slider, etc.)
│   ├── apps/                   # App implementations
│   │   ├── scommesse-eque-probabilita.tsx
│   │   ├── bayes-moneta.tsx
│   │   └── stima-probabilita-soggettiva.tsx
│   └── app-sidebar.tsx         # Resizable navigation sidebar
├── lib/
│   ├── apps.ts                 # App registry and metadata
│   └── utils.ts                # Utility functions
└── CLAUDE.md                   # This file
```

## Design System

### Color Palette
- **Primary**: `#003366` (dark blue) - main brand color, buttons, active states
- **Secondary**: `#CCCCCC` (light gray) - borders, dividers
- **Muted**: `#F5F5F5` (very light gray) - background highlights
- **Muted Foreground**: `#666666` - secondary text
- **Card**: `#FFFFFF` - card backgrounds
- **Sidebar**: `#FAFAFA` - sidebar background

### Typography Conventions
- **Titles**: `font-serif` (EB Garamond) + `font-semibold`
- **Body Text**: `font-sans` (Nunito Sans) - default
- **Large Numbers**: `font-serif` + `text-4xl/5xl/6xl` + `tabular-nums`
- **Labels**: `text-sm` + `font-semibold`

### Spacing Conventions
- Main sections: `space-y-6`
- Subsections: `space-y-4`
- Card content: `space-y-6` or `space-y-8`
- Grid gaps: `gap-6` or `gap-4`

## Adding a New App

### 1. Register in App Registry (`lib/apps.ts`)
```typescript
{
  id: 'your-app-id',
  title: 'Your App Title',
  description: 'Brief description of what the app does',
  icon: '📊', // Emoji icon
  category: 'Category Name' // e.g., 'Probabilità'
}
```

### 2. Create Component (`components/apps/your-app-id.tsx`)
```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// For number formatting (prevents hydration errors)
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('it-IT').format(Math.round(num))
}

export default function YourApp() {
  const [value, setValue] = useState(0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Title with Emoji</CardTitle>
          <CardDescription>
            Description text explaining what this section does
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content here */}
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3. Register Route (`app/apps/[slug]/page.tsx`)
```typescript
import YourAppComponent from '@/components/apps/your-app-id'

const components: Record<string, React.ComponentType> = {
  'your-app-id': YourAppComponent,
  // ... existing apps
}
```

## Current Apps

### 1. Scommesse Eque e Probabilità (🎲)
Fair betting calculator with three sections:
- Fair bet calculation from probability
- Implicit probability from bet terms
- Interactive simulation with visualization

### 2. Teorema di Bayes: La Moneta Misteriosa (🪙)
Interactive Bayesian reasoning demo:
- Multi-step educational walkthrough
- Coin flip probability updating
- Visual explanations of Bayes' theorem

### 3. Stimatore Probabilità Soggettiva (🏠)
Subjective probability estimation tool (Roberto's case):
- Method 1: Insurance premium approach
- Method 2: Selling price evaluation
- Method 3: Fair betting odds
- Comparison table and sensitivity analysis

## Sidebar Features

### Resizable Sidebar
- **How to resize**: Drag the right edge of the sidebar
- **Range**: 240px (min) to 480px (max)
- **Implementation**: Custom `SidebarRail` component with drag handlers
- **State Management**: Width stored in `SidebarContext`

### Collapsible Sidebar
- **Keyboard shortcut**: `Cmd/Ctrl + B`
- **Button**: Hamburger menu in top header
- **Mode**: `collapsible="icon"` - collapses to icon-only view

## Important Development Notes

### Hydration Issues
❌ **DON'T** use `.toLocaleString()` directly in JSX - causes hydration mismatches
✅ **DO** use the `formatNumber()` helper with `Intl.NumberFormat`

```typescript
// Bad - causes hydration error
<span>€{value.toLocaleString()}</span>

// Good - consistent server/client rendering
<span>€{formatNumber(value)}</span>
```

### Number Formatting
All monetary values use Italian locale formatting (e.g., "300.000" instead of "300,000")

### Component Patterns
- All app components must be Client Components (`"use client"`)
- Use Card components for main sections
- Keep consistent spacing with `space-y-*` utilities
- Use semantic color variables from theme

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

## Server Details
- **Dev Server**: http://localhost:3000
- **Network**: http://192.168.1.109:3000
- **Framework**: Next.js 16.0.0 with Turbopack

## Git Information
- **Current Branch**: main
- **Main Branch**: main
- **Recent Work**: Added Bayes app, modified styling, initial Next.js setup

## Future Enhancements
- Consider adding more probability/statistics apps
- Potential categories: Statistics, Decision Theory, Game Theory
- Could add dark mode support (already configured in globals.css)
- Consider adding data persistence (localStorage or cookies)

## Notes for Claude
- Always use the `formatNumber()` helper for consistent number formatting
- Follow the established Card-based layout pattern
- Maintain consistent spacing and typography
- Test sidebar resizing after making layout changes
- The project uses Italian locale (lang="it") for content and number formatting
