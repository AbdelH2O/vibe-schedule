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

## Recent Changes
- 001-foundation-data-model: Added TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3
