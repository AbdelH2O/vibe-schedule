# Data Model: Polish & Indicators

**Feature**: 006-polish-indicators
**Date**: 2026-01-18

## Overview

Phase 6 (Polish & Indicators) introduces no new data entities. All enhancements operate on existing data models defined in previous phases. This document describes computed/derived values and UI state additions.

## Existing Entities (Unchanged)

These entities are defined in `lib/types.ts` and remain unchanged:

### Context
```typescript
interface Context {
  id: string;
  name: string;
  priority: 1 | 2 | 3 | 4 | 5;
  minDuration?: number;      // minutes
  maxDuration?: number;      // minutes
  weight?: number;           // 0-100
  importantDates: ImportantDate[];
  createdAt: string;
  updatedAt: string;
}

interface ImportantDate {
  id: string;
  label: string;
  date: string;              // ISO date string
}
```

### Task
```typescript
interface Task {
  id: string;
  title: string;
  contextId: string | null;  // null = inbox
  deadline?: string;         // ISO date string
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Session (Working Mode)
```typescript
interface Session {
  allocations: Allocation[];
  activeContextId: string;
  contextStartTime: number;  // timestamp
  isPaused: boolean;
  pausedAt?: number;         // timestamp when paused
}

interface Allocation {
  contextId: string;
  allocated: number;         // minutes
  used: number;              // minutes consumed
}
```

## Derived/Computed Values (New)

These values are computed at render time, not stored:

### Deadline Urgency

```typescript
type DeadlineUrgency = 'overdue' | 'urgent' | 'warning' | 'neutral';

function getDeadlineUrgency(date: string): DeadlineUrgency {
  const now = new Date();
  const deadline = new Date(date);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'urgent';     // today
  if (diffDays <= 3) return 'warning';     // 1-3 days
  return 'neutral';                         // 4+ days
}
```

### Countdown Display

```typescript
interface CountdownDisplay {
  text: string;              // e.g., "2 days", "5 hours", "Overdue"
  urgency: DeadlineUrgency;
}

function formatCountdown(date: string): CountdownDisplay {
  // Returns human-readable relative time with urgency level
  // Implementation in lib/dates.ts
}
```

### Time Progress

```typescript
interface TimeProgress {
  percentage: number;        // 0-100 (can exceed 100 for overtime)
  status: 'normal' | 'warning' | 'urgent' | 'overtime';
  remaining: number;         // minutes (negative if overtime)
}

function getTimeProgress(allocated: number, used: number): TimeProgress {
  const remaining = allocated - used;
  const percentage = (used / allocated) * 100;

  if (remaining < 0) return { percentage, status: 'overtime', remaining };
  if (percentage >= 90) return { percentage, status: 'urgent', remaining };
  if (percentage >= 75) return { percentage, status: 'warning', remaining };
  return { percentage, status: 'normal', remaining };
}
```

## UI State Additions

These values exist only in component state, not persisted:

### Sidebar Visibility (Mobile)
```typescript
// In AppShell or Sidebar component
const [sidebarOpen, setSidebarOpen] = useState(false);
```

### Error State
```typescript
// In page.tsx error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
```

### Toast Notifications
```typescript
// Using shadcn/ui toast
type ToastVariant = 'default' | 'destructive';

interface Toast {
  title: string;
  description?: string;
  variant: ToastVariant;
}
```

## Validation Rules (Existing, Enforced)

These validation rules from previous phases remain in effect:

| Field | Rule | Error Message |
|-------|------|---------------|
| Context.name | Non-empty, max 100 chars | "Context name is required" / "Name too long" |
| Context.priority | 1-5 integer | "Priority must be between 1 and 5" |
| Context.minDuration | Positive integer if set | "Minimum duration must be positive" |
| Context.maxDuration | >= minDuration if both set | "Maximum must be >= minimum" |
| Context.weight | 0-100 if set | "Weight must be between 0 and 100" |
| Task.title | Non-empty, max 200 chars | "Task title is required" / "Title too long" |
| Session duration | Positive integer | "Session duration must be positive" |

## State Transitions

### Mode Transitions
```
Definition Mode ─────────────────────────────────────────► Working Mode
     │              (User clicks Start, sets duration,          │
     │               allocations computed)                      │
     │                                                          │
     ◄──────────────────────────────────────────────────────────┘
              (Session ends: manual stop, time exhausted,
               or session discarded from recovery)
```

### Session Lifecycle
```
Not Started ──► Active ──┬──► Paused ──► Active (resumed)
                         │                    │
                         │                    ▼
                         └─────────────► Completed
                                (time exhausted or manual end)
```

## No Schema Migrations Required

Phase 6 adds no persistent data. Existing localStorage schema remains compatible.
