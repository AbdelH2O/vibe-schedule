# Data Model: Working Mode

**Feature**: 005-working-mode
**Date**: 2026-01-18

## Overview

Working Mode operates on existing data structures from Phase 1 (Foundation) and Phase 4 (Time Allocation). This document describes how existing types are used and any additions needed.

---

## Existing Types (No Changes Required)

### Session

```typescript
// lib/types.ts - EXISTING
interface Session {
  id: string;
  totalDuration: number;      // Total session time in minutes
  startedAt: string;          // ISO timestamp when session began
  allocations: ContextAllocation[];
  activeContextId: string | null;
  contextStartedAt: string | null;  // When current context became active
  status: 'active' | 'paused' | 'completed';
}
```

**Usage in Working Mode**:
- `totalDuration`: Display total session time, calculate session time remaining
- `startedAt`: Reference point for session duration
- `activeContextId`: Determines which context is currently receiving time
- `contextStartedAt`: Used to calculate elapsed time for active context
- `status`: Controls timer behavior and UI state

### ContextAllocation

```typescript
// lib/types.ts - EXISTING
interface ContextAllocation {
  contextId: string;
  allocatedMinutes: number;   // Time assigned by allocation algorithm
  usedMinutes: number;        // Cumulative time spent (updated on switch)
}
```

**Usage in Working Mode**:
- `allocatedMinutes`: Display allocated time, calculate remaining
- `usedMinutes`: Updated when switching contexts; persisted for multi-activation tracking

### AppMode

```typescript
// lib/types.ts - EXISTING
type AppMode = 'definition' | 'working';
```

**Usage**: Determines which UI to render (DefinitionModeView vs WorkingModeView)

---

## Derived/Computed Values (Not Stored)

These values are calculated at runtime, not persisted:

### ContextTimeRemaining

```typescript
// Calculated in components
type ContextTimeRemaining = {
  contextId: string;
  allocatedMinutes: number;
  usedMinutes: number;        // From allocation + current elapsed
  remainingMinutes: number;   // allocated - used
  isOvertime: boolean;        // remainingMinutes < 0
};
```

### SessionTimeRemaining

```typescript
// Calculated in components
type SessionTimeRemaining = {
  totalMinutes: number;       // session.totalDuration
  usedMinutes: number;        // Sum of all context usedMinutes
  remainingMinutes: number;   // total - used
  isExhausted: boolean;       // remainingMinutes <= 0
};
```

### SessionSummary (Transient Display)

```typescript
// Used only for summary display, not persisted
type SessionSummary = {
  duration: {
    planned: number;          // session.totalDuration
    actual: number;           // Sum of all usedMinutes
  };
  contexts: Array<{
    contextId: string;
    contextName: string;
    allocatedMinutes: number;
    usedMinutes: number;
    variance: number;         // used - allocated
  }>;
  tasks: {
    totalCompleted: number;
    byContext: Array<{
      contextId: string;
      contextName: string;
      completedCount: number;
    }>;
  };
};
```

---

## State Transitions

### Session Status

```
                  START_SESSION
    (no session) ──────────────────► active
                                        │
                    PAUSE_SESSION       │
                   ◄────────────────────┤
                   │                    │
                   ▼                    │
                 paused ────────────────┤ RESUME_SESSION
                   │                    │
                   │    END_SESSION     │
                   └────────────────────┴────────► completed ──► (session = null)
                                                        │
                                              (return to definition mode)
```

### Timer State (Derived from Session)

```
Session.status === 'active'
  └── Timer is RUNNING
      └── Increment usedMinutes each second

Session.status === 'paused'
  └── Timer is FROZEN
      └── No time accumulation

Session.status === 'completed' or session === null
  └── Timer is HIDDEN
      └── Definition Mode shown
```

---

## Store Actions (Existing)

All required store actions already exist in `lib/store.tsx`:

| Action | Payload | Effect |
|--------|---------|--------|
| `START_SESSION` | `{ totalDuration, allocations }` | Creates session, sets mode to 'working' |
| `SWITCH_CONTEXT` | `{ contextId, elapsedMinutes }` | Updates previous context's usedMinutes, sets new activeContextId |
| `UPDATE_SESSION_TIME` | `{ contextId, usedMinutes }` | Updates specific allocation's usedMinutes |
| `PAUSE_SESSION` | none | Sets session.status to 'paused' |
| `RESUME_SESSION` | none | Sets session.status to 'active', updates contextStartedAt |
| `END_SESSION` | none | Clears session, sets mode to 'definition' |
| `TOGGLE_TASK_COMPLETED` | taskId | Toggles task.completed (works in any mode) |

---

## Validation Rules

### Session Start
- At least one context must exist
- Session duration must be 1-720 minutes (enforced in Phase 4)
- Allocations must sum to session duration

### Context Switch
- Target context must exist in session.allocations
- Cannot switch to same context (no-op)

### Task Completion
- Task must belong to active context (UI enforces by filtering display)
- Toggle is idempotent

### Session End
- Session must exist
- Can end from any status (active, paused)

---

## Data Flow

```
User clicks "Start Session"
        │
        ▼
SessionSetupDialog calculates allocations
        │
        ▼
startSession(duration, sortedAllocations)
        │
        ▼
Store: session created, mode = 'working'
        │
        ▼
WorkingModeView renders
        │
        ├─────────────────────────────────────────┐
        ▼                                         │
ContextTimer reads:                               │
  - session.contextStartedAt                      │
  - current allocation.usedMinutes                │
        │                                         │
        ▼                                         │
Timer tick (setInterval 1s):                      │
  - elapsed = (now - contextStartedAt) / 60000   │
  - remaining = allocated - (used + elapsed)      │
        │                                         │
        ▼                                         ▼
User switches context ───────────► switchContext(newId, currentUsed + elapsed)
        │                                         │
        ▼                                         ▼
Timer resets to new context ◄─────────────────────┘
        │
        ▼
User ends session (or time exhausted)
        │
        ▼
SessionSummary calculates from final state
        │
        ▼
endSession() clears session, mode = 'definition'
```

---

## Persistence Behavior

1. **On every state change**: `saveState(state)` persists to localStorage (existing behavior)
2. **On browser refresh/close during active session**:
   - Session state preserved in localStorage
   - On next app load, hydrate from storage
   - Calculate missed time: `(now - contextStartedAt)` if status was 'active'
   - Prompt user to resume or end session
3. **On session end**: session becomes null, mode becomes 'definition'
