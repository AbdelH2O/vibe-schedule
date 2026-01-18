# Quickstart: Polish & Indicators

**Feature**: 006-polish-indicators
**Date**: 2026-01-18

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Phases 1-5 completed (foundation, contexts, tasks, time allocation, working mode)

## Setup

```bash
# Clone and checkout branch
git checkout 006-polish-indicators

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:3000 in your browser.

## Development Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

## Key Files to Modify

### Deadline Indicators
- `lib/dates.ts` - Add countdown formatting and urgency classification
- `app/components/contexts/ContextListItem.tsx` - Display context important date countdowns
- `app/components/contexts/ContextDetail.tsx` - Enhanced important dates display
- `app/components/tasks/TaskListItem.tsx` - Deadline urgency styling

### Time Visualizations
- `app/components/working/ContextTimer.tsx` - Add progress bar
- `app/components/working/SessionTimer.tsx` - Add progress bar with thresholds
- `app/components/working/ContextSwitcher.tsx` - Progress indicators per context

### Mode Transitions
- `app/components/ModeIndicator.tsx` - Entry animation
- `app/components/AppShell.tsx` - Transition classes on layout
- `app/page.tsx` - aria-live region for mode announcements

### Empty States
- `app/components/shared/EmptyState.tsx` - Enhanced with illustrations
- `app/components/Sidebar.tsx` - No contexts empty state
- `app/components/contexts/ContextDetail.tsx` - No tasks empty state

### Responsive Design
- `app/components/AppShell.tsx` - Responsive grid layout
- `app/components/Sidebar.tsx` - Mobile toggle menu
- `app/components/working/WorkingModeView.tsx` - Mobile-friendly stacking

### Accessibility
- `app/components/working/SessionTimer.tsx` - aria-live for time updates
- `app/components/ModeIndicator.tsx` - aria-live for mode changes
- All interactive components - Verify focus indicators

### Error Handling
- `app/page.tsx` - Error boundary wrapper
- `components/ui/toaster.tsx` - Add toast provider (shadcn)
- `lib/storage.ts` - Error handling for localStorage operations

## Testing Checklist

### Deadline Indicators
- [ ] Create context with important date tomorrow → shows "1 day" amber
- [ ] Create task with deadline yesterday → shows "Overdue" red
- [ ] Create task with deadline in 2 weeks → shows neutral gray

### Time Visualizations
- [ ] Start session → progress bars visible
- [ ] Wait until 75% elapsed → warning color appears
- [ ] Wait until 90% elapsed → urgent color appears
- [ ] Continue past allocation → overtime styling (pulsing red)
- [ ] Pause session → progress bars freeze

### Mode Transitions
- [ ] Start session → smooth animation, screen reader announces
- [ ] End session → smooth transition back, summary shown
- [ ] In working mode, try to edit → clear disabled indicator

### Empty States
- [ ] Clear all data → main empty state with "Create context" CTA
- [ ] Create context with no tasks → task empty state
- [ ] Empty inbox → inbox explanation

### Responsive Design
- [ ] Resize to mobile (<640px) → sidebar collapses
- [ ] Resize to tablet (640-1024px) → appropriate layout
- [ ] Touch targets → all buttons at least 44x44px

### Accessibility
- [ ] Tab through entire app → all elements reachable
- [ ] Screen reader → mode changes announced
- [ ] Screen reader → task completion announced
- [ ] All dialogs → focus trapped, Escape closes

### Error Handling
- [ ] Invalid form input → inline error shown
- [ ] Fill localStorage (simulate) → toast with suggestions
- [ ] Corrupt localStorage data → recovery dialog

## Styling Reference

### Urgency Colors (Tailwind)
```
Urgent/Overdue: text-destructive, bg-destructive/10
Warning:        text-amber-500, bg-amber-50
Neutral:        text-muted-foreground
```

### Progress Thresholds
```
Normal:   >25% remaining  → default progress bar
Warning:  10-25% remaining → amber progress bar
Urgent:   <10% remaining  → red progress bar
Overtime: negative        → red + animate-pulse
```

### Breakpoints
```
Mobile:  < 640px  (sm:)
Tablet:  640-1024px (md:, lg:)
Desktop: > 1024px (xl:, 2xl:)
```

### Touch Targets
```
Minimum: 44x44px → min-h-11 min-w-11 or p-3 on buttons
```

## Adding shadcn/ui Components

If additional components are needed:

```bash
# Add Progress component
pnpm dlx shadcn@latest add progress

# Add Toast component
pnpm dlx shadcn@latest add toast

# Add Sonner (alternative toast)
pnpm dlx shadcn@latest add sonner
```

## Troubleshooting

### Timer not updating
- Check `isPaused` state in store
- Verify `useEffect` interval is running
- Check browser tab visibility (timers may pause in background)

### Animations not smooth
- Ensure `transition-all duration-300` classes applied
- Check for conflicting CSS
- Verify no JavaScript re-renders during animation

### Accessibility issues
- Use browser DevTools Accessibility panel
- Test with actual screen reader (VoiceOver, NVDA)
- Check aria-live regions have correct politeness level
