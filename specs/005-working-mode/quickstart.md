# Quickstart: Working Mode Implementation

**Feature**: 005-working-mode
**Date**: 2026-01-18

## Prerequisites

Before implementing Working Mode, ensure:
- Phase 4 (Time Allocation Engine) is complete
- Session setup dialog works and can start sessions
- Store has session actions (START_SESSION, SWITCH_CONTEXT, etc.)

## Getting Started

### 1. Create Working Mode Directory

```bash
mkdir -p app/components/working
```

### 2. Create Timer Utilities

Create `lib/timer.ts` with:

```typescript
/**
 * Format seconds as MM:SS or HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = Math.floor(absSeconds % 60);

  const prefix = isNegative ? '+' : '';

  if (hours > 0) {
    return `${prefix}${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${prefix}${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate remaining seconds for a context
 */
export function calculateRemainingSeconds(
  allocatedMinutes: number,
  usedMinutes: number,
  elapsedSeconds: number
): number {
  const allocatedSeconds = allocatedMinutes * 60;
  const usedSeconds = usedMinutes * 60;
  return allocatedSeconds - usedSeconds - elapsedSeconds;
}
```

### 3. Create Core Components (in order)

1. **ContextTimer.tsx** - Real-time countdown display
2. **ActiveContextPanel.tsx** - Current context with timer
3. **ContextSwitcher.tsx** - List of available contexts
4. **WorkingTaskList.tsx** - Filtered task list with completion
5. **SessionControls.tsx** - Pause/Resume/End buttons
6. **EndSessionDialog.tsx** - Confirmation modal
7. **SessionSummary.tsx** - Post-session display
8. **WorkingModeView.tsx** - Main container composing all above

### 4. Integrate with Main Page

Update `app/page.tsx` to conditionally render:

```tsx
{state.mode === 'working' && state.session ? (
  <WorkingModeView />
) : (
  // Existing Definition Mode UI
)}
```

### 5. Test Scenarios

Run through these scenarios manually:

1. **Start session**: Create contexts, start session, verify timer starts
2. **Context switch**: Switch contexts, verify time transfers correctly
3. **Task completion**: Mark tasks complete, verify persistence
4. **Pause/Resume**: Pause, wait, resume, verify no time lost during pause
5. **End session**: End early, verify summary shows, return to Definition Mode
6. **Auto-complete**: Let timer run to zero, verify auto-completion
7. **Browser refresh**: Refresh during session, verify recovery works

## Component Architecture

```
WorkingModeView
├── Header
│   └── SessionTimer (total time remaining)
├── Main Content
│   ├── ActiveContextPanel
│   │   ├── Context Name
│   │   └── ContextTimer (context time remaining)
│   └── WorkingTaskList
│       └── WorkingTaskItem[] (with checkboxes)
├── Sidebar
│   └── ContextSwitcher
│       └── Context items (clickable to switch)
└── Footer
    └── SessionControls
        ├── Pause/Resume Button
        └── End Session Button

EndSessionDialog (modal, shown on End click)
SessionSummary (modal, shown after session ends)
```

## Key Implementation Notes

1. **Timer Tick Pattern**:
   ```tsx
   useEffect(() => {
     if (session.status !== 'active') return;

     const interval = setInterval(() => {
       const elapsed = (Date.now() - new Date(session.contextStartedAt!).getTime()) / 1000;
       setElapsedSeconds(Math.floor(elapsed));
     }, 1000);

     return () => clearInterval(interval);
   }, [session.status, session.contextStartedAt]);
   ```

2. **Context Switch**:
   ```tsx
   const handleSwitchContext = (newContextId: string) => {
     const elapsed = (Date.now() - new Date(session.contextStartedAt!).getTime()) / 1000 / 60;
     const currentUsed = currentAllocation.usedMinutes;
     switchContext(newContextId, currentUsed + elapsed);
   };
   ```

3. **Read-Only Mode**: In Working Mode, hide add/edit/delete buttons on tasks and contexts

4. **Overtime Visual**: When remaining time < 0, show red tint and "+X:XX" format

## Verification Checklist

- [ ] `pnpm dev` starts without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] Session survives browser refresh
- [ ] Timer accuracy within spec (< 1 second drift per hour)
- [ ] All acceptance scenarios from spec pass
