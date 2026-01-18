# Research: Working Mode

**Feature**: 005-working-mode
**Date**: 2026-01-18

## Overview

Research findings for implementing the Working Mode execution phase of vibe-schedule.

---

## 1. Real-Time Timer Implementation in React

**Decision**: Use `setInterval` with 1-second tick combined with `useRef` for accumulator pattern

**Rationale**:
- React 19 with client components supports traditional interval patterns
- 1-second precision matches spec requirement (SC-003: <1 second drift per hour)
- `useRef` for storing elapsed time avoids re-render on every tick when not needed
- `Date.now()` for calculating actual elapsed time compensates for JavaScript timer drift

**Alternatives Considered**:
- `requestAnimationFrame` - Overkill for 1-second precision; designed for 60fps animations
- Web Workers - Unnecessary complexity for single-user app; no multi-tab sync needed
- External timer library - Adds dependency; simple implementation is sufficient

**Implementation Pattern**:
```typescript
// Store the timestamp when context became active
// On each tick: elapsed = (Date.now() - contextStartedAt) / 1000 / 60
// This compensates for any timer drift or tab backgrounding
```

---

## 2. Session State Persistence on Browser Close/Refresh

**Decision**: Leverage existing localStorage persistence with contextStartedAt timestamp for time recovery

**Rationale**:
- AppState already persists session to localStorage on every state change (lib/store.tsx)
- Session.contextStartedAt allows calculating elapsed time since last save
- On hydration, can calculate "missing" time if session was active

**Alternatives Considered**:
- IndexedDB - Overkill for simple key-value state; localStorage sufficient for app scale
- Service Worker for background sync - Not needed for single-device, single-user app
- No recovery (just end session) - Poor UX; users expect persistence

**Recovery Strategy**:
1. On app load, check if session exists and status is 'active' or 'paused'
2. If 'active': Calculate elapsed time since contextStartedAt, add to usedMinutes
3. Show recovery dialog: "Session in progress - Resume or End?"
4. If 'paused': Simply restore state as-is

---

## 3. Mode-Based UI Rendering

**Decision**: Conditional rendering at page level based on `state.mode`

**Rationale**:
- Constitution Principle V (Dual-Mode Clarity) requires explicit visual distinction
- Single-page app with mode toggle is simpler than route-based separation
- Existing page.tsx already conditionally renders based on selected context

**Alternatives Considered**:
- Separate routes (/definition, /working) - Adds routing complexity; mode is not a navigation concept
- Overlay/modal for Working Mode - Doesn't convey "different mode" strongly enough
- CSS-only hide/show - Makes component trees harder to reason about

**Pattern**:
```tsx
// page.tsx
{state.mode === 'working' ? (
  <WorkingModeView />
) : (
  <DefinitionModeView />
)}
```

---

## 4. Context Switching Time Transfer

**Decision**: Calculate elapsed time at switch moment, update previous context's usedMinutes, set new activeContextId

**Rationale**:
- Existing store has SWITCH_CONTEXT action that takes elapsedMinutes
- Calculation at switch time (not continuously) is simpler and matches spec
- usedMinutes is cumulative across multiple activations of same context

**Implementation**:
```typescript
// When switching from Context A to Context B:
// 1. Calculate: elapsedSinceStart = (now - contextStartedAt) / 1000 / 60
// 2. Dispatch: switchContext(newContextId, currentAllocation.usedMinutes + elapsedSinceStart)
// 3. Store updates: activeContextId, contextStartedAt, previous context's usedMinutes
```

---

## 5. Overtime Behavior When Context Time Depleted

**Decision**: Allow continued work with visual overtime indicator; no automatic context switch

**Rationale**:
- Constitution Principle I (Flow Over Rigidity) - don't interrupt user focus
- Constitution Principle III (Flexible Constraints) - caps inform, don't block
- User can manually switch when ready

**Visual Indication**:
- Timer shows negative time or "Overtime: +X:XX"
- Background color change (subtle red/orange tint)
- No audio alert for ongoing overtime (only initial zero-crossing)

---

## 6. Audio Notifications

**Decision**: Use Web Audio API for short notification sounds; provide visual fallback

**Rationale**:
- Native browser API, no external dependencies
- Can be easily muted via user preference (future enhancement)
- Visual notification always accompanies audio for accessibility

**Trigger Points**:
- Context time reaches zero (single chime)
- Session time exhausted (completion sound)

**Implementation Notes**:
- Generate simple tones programmatically (sine wave oscillator)
- Keep sounds brief (<1 second) to avoid interruption
- Respect browser autoplay policies (user gesture required first)

---

## 7. Task Completion in Working Mode

**Decision**: Reuse existing TOGGLE_TASK_COMPLETED action; filter display to active context only

**Rationale**:
- Task completion persists to Definition Mode (FR-009, SC-007)
- Existing store action handles the update correctly
- Read-only for other task properties (add/edit/delete prevented)

**UI Pattern**:
- Checkbox or click-to-complete interaction
- Visual strikethrough for completed tasks
- Completed tasks remain visible (not auto-hidden)

---

## 8. Session Summary Data Structure

**Decision**: Calculate summary from final session state at completion; no new persistent type needed

**Rationale**:
- All needed data exists in Session.allocations (allocated vs used per context)
- Task completion count can be derived from tasks.filter(t => t.completed && t.contextId in session)
- Summary is transient display, not persisted

**Summary Contents**:
- Per-context: name, allocated minutes, used minutes, difference
- Total: session duration, actual time worked
- Tasks: completed count, by context

---

## 9. Pause/Resume Mechanism

**Decision**: Store pause timestamp; on resume, update contextStartedAt to now (preserving accumulated usedMinutes)

**Rationale**:
- Session.status already supports 'paused' state
- PAUSE_SESSION action exists in store
- RESUME_SESSION resets contextStartedAt to now

**Edge Case**:
- If browser closes while paused → session stays paused, no time calculation needed on recovery

---

## 10. Highest-Priority Context Selection at Session Start

**Decision**: Existing START_SESSION uses first allocation; need to sort allocations by priority before passing

**Rationale**:
- Spec requires highest-priority (lowest priority number) as initial active context
- calculateAllocations returns unsorted allocations
- Simple sort at session start time

**Implementation**:
```typescript
// In SessionSetupDialog before calling startSession:
const sortedAllocations = [...allocations].sort((a, b) => {
  const ctxA = contexts.find(c => c.id === a.contextId);
  const ctxB = contexts.find(c => c.id === b.contextId);
  return (ctxA?.priority ?? 5) - (ctxB?.priority ?? 5);
});
startSession(duration, sortedAllocations);
```

---

## Summary

All research items resolved. No NEEDS CLARIFICATION items remain. The implementation can leverage existing infrastructure (types, store, localStorage) with targeted additions for timer utilities and Working Mode UI components.
