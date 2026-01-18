# Research: Definition Mode - Context Management

**Date**: 2026-01-18 | **Branch**: `002-context-management`

## Overview

This document captures research findings for implementing Context CRUD operations. Since Phase 1 established the foundation (data model, store, persistence), this phase primarily involves UI component development using existing patterns.

## Research Findings

### 1. Existing Store Actions

**Decision**: Use existing store actions from `lib/store.tsx`

**Rationale**: Phase 1 already implemented all required CRUD operations:
- `addContext(context)` - creates context with auto-generated ID and timestamps
- `updateContext(id, updates)` - partial updates with automatic `updatedAt` refresh
- `deleteContext(id)` - removes context and moves associated tasks to Inbox

**Alternatives Considered**:
- Creating separate service layer → Rejected: unnecessary abstraction for localStorage-based app
- Using React Query/SWR → Rejected: no async data fetching needed for localStorage

### 2. Form Component Approach

**Decision**: Single `ContextForm` component for both create and edit modes

**Rationale**:
- Same fields for create and edit (name, priority, durations, weight, dates)
- Reduces code duplication
- Edit mode pre-populates from existing context
- Create mode starts with sensible defaults

**Alternatives Considered**:
- Separate CreateContextForm/EditContextForm → Rejected: 90% code overlap
- Form library (react-hook-form, formik) → Rejected: overkill for 6-field form with one validation rule

### 3. Priority Level UI

**Decision**: Dropdown select with labeled options (1=Highest through 5=Lowest)

**Rationale**:
- Clear semantic labels prevent confusion about which end is "high"
- Select component matches shadcn/ui patterns
- 5 discrete options are easily scannable

**Alternatives Considered**:
- Slider → Rejected: less precise, harder to hit exact values
- Radio buttons → Rejected: takes too much vertical space
- Number input → Rejected: requires users to remember scale meaning

### 4. Important Dates UI

**Decision**: Inline list with add/edit/remove capabilities

**Rationale**:
- Each important date has two fields (label, date) - compact enough for inline display
- Countdown badges show days remaining
- Remove button per item for easy deletion

**Alternatives Considered**:
- Modal for date management → Rejected: adds friction for simple operation
- Calendar picker widget → Deferred to future enhancement; native date input is sufficient for MVP

### 5. Date Countdown Calculation

**Decision**: Simple day difference calculation with three states: upcoming, soon (≤7 days), overdue

**Rationale**:
- Spec requires visual differentiation for dates within 7 days and overdue dates
- Day-level granularity is sufficient (no need for hours/minutes)
- Calculation is trivial: `Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))`

**Implementation**:
```typescript
function getDaysRemaining(dateString: string): number {
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
```

### 6. Validation Strategy

**Decision**: Client-side validation with inline error display

**Validation Rules**:
| Field | Rule | Error Message |
|-------|------|---------------|
| Name | Non-empty | "Context name is required" |
| Min Duration | If set with max, must be ≤ max | "Minimum cannot exceed maximum duration" |
| Max Duration | If set with min, must be ≥ min | "Maximum cannot be less than minimum duration" |
| Weight | Must be > 0 | "Weight must be greater than 0" |

**Rationale**: Simple validation doesn't need schema library; inline checks are sufficient

### 7. Delete Confirmation

**Decision**: Use AlertDialog from shadcn/ui

**Rationale**:
- Destructive action requires confirmation (spec requirement)
- AlertDialog provides accessible modal with focus management
- Clear action buttons (Cancel/Delete)

**Content**: "Are you sure you want to delete '{contextName}'? Tasks in this context will be moved to the Inbox."

### 8. shadcn/ui Components Needed

**Existing** (no install required):
- Button, Card, Badge, Input, Sheet, Separator, Tooltip, Skeleton

**To Add**:
- `label` - form field labels
- `select` - priority dropdown
- `alert-dialog` - delete confirmation

**Install Command**: `pnpm dlx shadcn@latest add label select alert-dialog`

## No Unresolved Questions

All technical decisions are clear. Proceed to Phase 1 design artifacts.
