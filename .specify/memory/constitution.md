<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version change: 1.0.0 → 1.1.0

  Modified principles: N/A

  Added sections:
  - Technical Standards > Stack Requirements: Added shadcn/ui as Component Library

  Removed sections: N/A

  Templates requiring updates: None

  Follow-up TODOs:
  - Migrate existing components to shadcn/ui
  ============================================================================
-->

# Vibe-Schedule Constitution

## Core Principles

### I. Flow Over Rigidity

All implementations MUST prioritize user flow and flexibility over strict scheduling constraints.

- Time allocation is dynamic, not fixed to calendar slots
- Work sessions begin when the user is ready, not at predetermined times
- Context switching MUST be seamless with proper time transfer mechanics
- UI MUST NOT interrupt user focus with modal dialogs or mandatory confirmations for routine actions

**Rationale**: Users achieve more when they work with their natural rhythms rather than fighting arbitrary time constraints.

### II. Context-First Architecture

Features MUST organize around contexts (focus areas) as the primary unit of organization, not tasks or time blocks.

- Contexts are top-level entities; tasks live within contexts
- Data models MUST support context → task relationships with clear ownership
- Views MUST be filterable by context to maintain focus
- The inbox serves as a staging area before context assignment—never a permanent location

**Rationale**: Organizing by what you're doing (context) enables deeper focus than organizing by when you're doing it.

### III. Flexible Constraints

Constraints (minimums, maximums, weights, priorities) MUST inform allocation without creating rigidity.

- Minimum durations guarantee time but MUST NOT block other contexts entirely
- Maximum durations cap investment but MUST allow user override when needed
- Weights distribute remaining time proportionally—equal distribution is the fallback
- Deadlines and important dates display as indicators, never as scheduling drivers or alarms

**Rationale**: Guardrails help without becoming prisons; the user retains ultimate control.

### IV. Simplicity First

Implementations MUST favor the simplest solution that satisfies requirements.

- No premature abstractions—three similar lines beat a speculative helper
- No feature flags or backward-compatibility shims for unreleased code
- No over-engineering: build for current requirements, not hypothetical futures
- TypeScript strict mode catches errors at compile time—leverage it fully
- Component composition over inheritance; hooks over HOCs

**Rationale**: Complexity accumulates silently; every abstraction must earn its place.

### V. Dual-Mode Clarity

The distinction between Definition Mode and Working Mode MUST be explicit in both UI and code.

- Definition Mode: planning, organizing, configuring—full access to structure changes
- Working Mode: execution, focus, progress—structure is read-only, actions affect time/completion
- Mode transitions MUST be intentional (explicit Start/Stop actions)
- State management MUST clearly separate configuration state from session state

**Rationale**: Clear modes reduce cognitive load by constraining available actions to what's relevant.

## Technical Standards

### Stack Requirements

- **Framework**: Next.js 16 with App Router (`app/` directory structure)
- **UI Library**: React 19 with Server Components where appropriate
- **Component Library**: shadcn/ui for consistent, accessible UI components
- **Language**: TypeScript in strict mode—no `any` types without documented justification
- **Styling**: Tailwind CSS 4 using `@import "tailwindcss"` syntax
- **Package Manager**: pnpm exclusively

### Quality Gates

- All components MUST be typed with explicit prop interfaces
- Server vs. client components MUST be explicitly marked (`'use client'` directive)
- API routes MUST validate input and return typed responses
- Accessibility: interactive elements MUST be keyboard-navigable and screen-reader compatible

### Performance

- Initial page load MUST leverage Server Components for data fetching
- Client-side state MUST be minimal—prefer URL state and server state
- Bundle size MUST be monitored; lazy loading for non-critical paths

## Development Workflow

### Contribution Process

1. Feature work begins with specification (`/speckit.specify`)
2. Implementation planning follows (`/speckit.plan`)
3. Task breakdown enables parallel work (`/speckit.tasks`)
4. Code changes require passing lint and type checks before commit
5. PRs MUST reference the originating specification

### Code Review Standards

- Changes MUST NOT introduce `any` types or disable TypeScript checks
- New components MUST follow existing naming conventions (`PascalCase` for components)
- CSS MUST use Tailwind utilities; custom CSS requires justification
- Test coverage is encouraged for complex logic but not mandatory for UI components

### Branch Strategy

- Feature branches: `[issue-number]-feature-name` format
- Main branch is protected; all changes via PR
- Commits follow conventional commits format

## Governance

This constitution supersedes conflicting guidance in other project documents. Amendments require:

1. Written proposal documenting the change and rationale
2. Update to this file with version increment
3. Review of dependent templates for consistency
4. Documentation of migration path if breaking changes

All implementation work MUST verify compliance with these principles. Complexity that violates Principle IV (Simplicity First) MUST be justified in the implementation plan's Complexity Tracking section.

For runtime development guidance, consult `CLAUDE.md` at the repository root.

**Version**: 1.1.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18
