# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Tech Stack

- **Next.js 16** with App Router (`app/` directory)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS 4** (using `@import "tailwindcss"` syntax)
- **shadcn/ui** - Component library (New York style, Lucide icons)
- **pnpm** as package manager

## Architecture

- Uses the Next.js App Router pattern - all routes in `app/`
- Path alias: `@/*` maps to project root
- Geist font family configured via CSS variables (`--font-geist-sans`, `--font-geist-mono`)
- Dark mode via `prefers-color-scheme` media query with CSS custom properties

## UI Components (shadcn/ui)

- Components are in `components/ui/` - these are customizable source files, not a package
- Add new components: `pnpm dlx shadcn@latest add <component-name>`
- Use `cn()` from `@/lib/utils` for class merging with Tailwind
- Prefer shadcn components over custom implementations for consistency
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`, `text-muted-foreground`)

## Active Technologies
- TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3 (001-foundation-data-model)
- Browser localStorage (single-device, offline-capable) (001-foundation-data-model)
- TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3, shadcn/ui, Lucide React, Radix UI primitives (002-context-management)
- Browser localStorage (via lib/storage.ts utilities) (002-context-management)
- TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3 + shadcn/ui, Lucide React, Radix UI primitives (004-time-allocation)
- Browser localStorage (via existing lib/storage.ts utilities) (005-working-mode)
- TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3, shadcn/ui, Tailwind CSS 4, Lucide React, Radix UI primitives (006-polish-indicators)
- Sonner toast notifications for error feedback (006-polish-indicators)
- TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3, shadcn/ui, Radix UI primitives, Lucide React (007-reminders-notifications)
- TypeScript 5 (strict mode) + shadcn/ui, Radix UI primitives, Lucide React, Tailwind CSS 4 (008-workmode-sidebar)

## Patterns & Conventions (006-polish-indicators)

### Deadline Urgency System
- `DeadlineUrgency` type: 'overdue' | 'urgent' | 'warning' | 'neutral'
- `getDeadlineUrgency()` and `formatCountdownWithUrgency()` in lib/dates.ts
- `getUrgencyColorClass()` in lib/utils.ts for consistent color mapping
- Use `CountdownBadge` component for deadline display

### Time Progress Visualization
- `TimeProgressStatus` type: 'normal' | 'warning' | 'urgent' | 'overtime'
- Thresholds: 75% (warning), 90% (urgent), 100%+ (overtime)
- `getTimeProgress()` in lib/dates.ts for calculations
- `getProgressColorClass()` in lib/utils.ts for color mapping
- `TimeProgressBar` component for consistent progress display

### Accessibility
- Use `useSyncExternalStore` for announcements to avoid setState in effects (React 19)
- Skip-to-content link in app/layout.tsx targeting `#main-content`
- aria-live regions for dynamic content announcements
- min-h-[44px] for touch targets on mobile

### Error Handling
- Next.js error.tsx for error boundaries
- Sonner toasts for storage errors and user feedback
- Toast deduplication via flags in lib/storage.ts

### Animations
- `animate-pulse-slow` for overtime indicators (2s cycle)
- `animate-fade-in` for mode transitions (0.3s)
- CSS keyframes in app/globals.css

## Recent Changes
- 008-workmode-sidebar: Added TypeScript 5 (strict mode) + shadcn/ui, Radix UI primitives, Lucide React, Tailwind CSS 4
- 007-reminders-notifications: Added TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3, shadcn/ui, Radix UI primitives, Lucide React
- 001-foundation-data-model: Added TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3
