# Research: Polish & Indicators

**Feature**: 006-polish-indicators
**Date**: 2026-01-18
**Status**: Complete

## Overview

This document captures research findings for Phase 6 polish features. Since the technical context is fully established (TypeScript, React 19, Next.js 16, Tailwind CSS 4, shadcn/ui), research focuses on implementation best practices for each polish area.

---

## 1. Deadline Countdown Indicators

### Decision: Relative time formatting with urgency thresholds

**Rationale**: Human-readable relative times ("2 days", "5 hours") are more immediately meaningful than absolute dates. Urgency thresholds (overdue → today → soon → future) map naturally to existing color tokens.

**Implementation Approach**:
- Enhance existing `lib/dates.ts` with countdown formatting functions
- Use existing `formatRelativeDate` as foundation, add urgency classification
- Three urgency levels: `urgent` (overdue/today), `warning` (1-3 days), `neutral` (4+ days)
- Apply to both context important dates and task deadlines

**Alternatives Considered**:
- External library (date-fns, dayjs) - Rejected: adds dependency for simple calculations; existing `lib/dates.ts` sufficient
- Absolute date display - Rejected: requires mental math; contradicts "Indicators over alarms" philosophy

**Color Mapping** (using existing Tailwind tokens):
- Urgent: `text-destructive` (red)
- Warning: `text-amber-500` (amber/yellow)
- Neutral: `text-muted-foreground` (gray)

---

## 2. Time Remaining Visualizations

### Decision: Progress bars with threshold-based styling

**Rationale**: Visual progress bars communicate time status faster than numbers alone. Threshold-based color changes (green → amber → red) provide at-a-glance urgency without interruption.

**Implementation Approach**:
- Add `Progress` component from shadcn/ui (already available in the library)
- Wrap existing `ContextTimer` and `SessionTimer` with progress bar visualization
- Thresholds: >25% normal, 10-25% warning, <10% urgent, overtime pulsing
- Pause visual updates when session is paused (already supported in store)

**Alternatives Considered**:
- Circular progress (radial) - Rejected: harder to scan quickly; linear progress more intuitive for time
- Animated countdown numbers only - Rejected: requires focus to read; progress bar visible peripherally

**Animation Strategy**:
- Smooth CSS transitions for progress bar width
- Pulse animation for overtime state using Tailwind `animate-pulse`
- Freeze animation when paused via conditional class

---

## 3. Mode Transition Feedback

### Decision: CSS transitions with aria-live announcements

**Rationale**: Subtle animations confirm mode changes without disrupting flow. Screen reader announcements ensure accessibility.

**Implementation Approach**:
- Add `transition-all duration-300` to mode-dependent layout containers
- Enhance `ModeIndicator` with entry animation (scale + fade)
- Add `aria-live="polite"` region for mode change announcements
- Existing Working Mode layout already distinct; enhance with smoother transition

**Alternatives Considered**:
- Page-level transition (full fade) - Rejected: too disruptive; violates "Flow over rigidity"
- No animation - Rejected: mode change can feel abrupt without visual confirmation
- Modal confirmation before mode change - Rejected: violates constitution (no modals for routine actions)

**Animation Specs**:
- Duration: 300ms (matches SC-005 success criterion)
- Easing: `ease-out` for natural feel
- Properties: opacity, transform (scale), background-color

---

## 4. Empty State Guidance

### Decision: Contextual illustrations with actionable CTAs

**Rationale**: Empty states are onboarding opportunities. Each empty area should explain its purpose and provide a clear next action.

**Implementation Approach**:
- Enhance existing `EmptyState` component with illustration support (Lucide icons)
- Define specific messages for each empty area:
  - No contexts: "Create your first context to organize your work"
  - No tasks in context: "Add tasks to track what needs to be done"
  - Empty inbox: "The inbox holds unassigned tasks—drag here or create new"
  - No session contexts: "Create contexts before starting a work session"
- Include primary action button where applicable

**Alternatives Considered**:
- Generic "No data" message everywhere - Rejected: misses guidance opportunity
- Tutorial overlay - Rejected: too heavy; simple contextual hints sufficient for MVP

**Icon Selection** (Lucide):
- No contexts: `FolderPlus`
- No tasks: `ListPlus` or `CheckCircle2`
- Empty inbox: `Inbox`
- Session blocked: `AlertCircle`

---

## 5. Responsive Design

### Decision: Tailwind responsive utilities with mobile-first approach

**Rationale**: Tailwind's built-in responsive prefixes (`sm:`, `md:`, `lg:`) align with existing codebase patterns. Mobile-first ensures core functionality works on all devices.

**Implementation Approach**:
- Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Mobile: Sidebar collapses to hamburger menu; single-column layout
- Tablet: Two-column where appropriate; sidebar visible but narrower
- Desktop: Full three-column layout (existing)
- Touch targets: Minimum 44x44px (use `min-h-11 min-w-11` or `p-3` on buttons)

**Alternatives Considered**:
- CSS Container Queries - Rejected: less browser support; Tailwind responsive sufficient
- Separate mobile/desktop components - Rejected: code duplication; responsive utilities cleaner

**Key Changes**:
- `Sidebar.tsx`: Add toggle button, hide by default on mobile
- `AppShell.tsx`: Conditional grid columns based on viewport
- `WorkingModeView.tsx`: Stack context switcher below active context on mobile

---

## 6. Keyboard Navigation & Accessibility

### Decision: Focus management with ARIA live regions

**Rationale**: shadcn/ui components include built-in accessibility. Enhancements focus on custom interactions (context switching, task completion) and dynamic content updates.

**Implementation Approach**:
- Verify all interactive elements have `tabIndex` and visible focus states (shadcn default)
- Add `aria-live="polite"` for timer updates (throttled to every 30 seconds to avoid noise)
- Add `aria-live="assertive"` for session completion and critical alerts
- Focus trap in dialogs (already handled by Radix UI primitives)
- Keyboard shortcuts: existing Space/Escape; add documentation

**Alternatives Considered**:
- Custom focus management library - Rejected: Radix UI already handles this
- Announce every timer tick - Rejected: too noisy; throttle to meaningful intervals

**Testing Strategy**:
- Manual testing with VoiceOver (macOS) and NVDA (Windows)
- Tab through entire application flow
- Verify screen reader announces mode changes and task completions

---

## 7. Error Handling & Recovery

### Decision: Error boundaries with toast notifications

**Rationale**: Error boundaries prevent full-page crashes. Toast notifications provide non-intrusive feedback for recoverable errors.

**Implementation Approach**:
- Add React Error Boundary wrapper in `page.tsx` or `layout.tsx`
- Use shadcn/ui `Toast` component for storage and validation errors
- Storage errors: Check quota before save, show clear message with suggestions
- Form validation: Inline field-level errors (already pattern in shadcn forms)
- Data corruption: Offer "Reset data" option with confirmation

**Alternatives Considered**:
- Global error modal - Rejected: too disruptive for recoverable errors
- Silent failure with console.log - Rejected: user has no visibility into issues
- Full-page error state for all errors - Rejected: overkill for validation errors

**Error Categories**:
1. **Validation errors**: Inline, field-level (existing pattern)
2. **Storage errors**: Toast with retry/clear suggestions
3. **Data corruption**: Full-page recovery dialog with reset option
4. **Unexpected errors**: Error boundary with "Try again" button

---

## Summary

All research items resolved. No NEEDS CLARIFICATION markers remain. Implementation can proceed to Phase 1 design artifacts.

| Area | Decision | Key Technology |
|------|----------|----------------|
| Deadline Indicators | Relative time with urgency thresholds | Enhanced `lib/dates.ts` |
| Time Visualizations | Progress bars with threshold styling | shadcn/ui Progress + Tailwind |
| Mode Transitions | CSS transitions + aria-live | Tailwind transitions, ARIA |
| Empty States | Contextual illustrations + CTAs | Enhanced EmptyState + Lucide |
| Responsive Design | Tailwind responsive utilities | Tailwind breakpoints |
| Accessibility | Focus management + ARIA live regions | shadcn/ui + Radix + ARIA |
| Error Handling | Error boundaries + toast notifications | React Error Boundary + shadcn Toast |
