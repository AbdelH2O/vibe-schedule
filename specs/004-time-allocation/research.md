# Research: Time Allocation Engine

**Feature**: 004-time-allocation
**Date**: 2026-01-18

## Infrastructure Assessment

### Existing Store Infrastructure

**Finding**: Session management infrastructure already exists in `lib/store.tsx` and `lib/types.ts`.

**Existing Types**:
- `Session` - Contains totalDuration, allocations, activeContextId, status
- `ContextAllocation` - Contains contextId, allocatedMinutes, usedMinutes
- `AppMode` - 'definition' | 'working'

**Existing Actions**:
- `startSession(totalDuration, allocations)` - Creates session and transitions to working mode
- `switchContext(contextId, elapsedMinutes)` - Updates allocations and switches context
- `updateSessionTime(contextId, usedMinutes)` - Updates time tracking
- `endSession()` - Clears session and returns to definition mode
- `pauseSession()` / `resumeSession()` - Session lifecycle

**Decision**: Use existing types and actions. Only add the allocation algorithm as a pure function.

**Rationale**: Infrastructure is complete from Phase 1. No need to modify store or types.

**Alternatives Considered**:
- Adding new types for AllocationPreview - Rejected; ContextAllocation[] suffices
- Adding allocation action to store - Rejected; pure function is simpler and more testable

---

### Allocation Algorithm Design

**Finding**: The algorithm needs to handle a multi-step distribution with constraints.

**Algorithm Steps**:
1. Sum all minimum durations
2. If sum exceeds session time → return over-committed result with warning
3. Allocate minimums to each context
4. Calculate remaining time after minimums
5. Distribute remaining time by weight ratio
6. For each context: if allocated > maximum, cap at maximum and collect excess
7. Redistribute excess to uncapped contexts (repeat until no excess or all capped)
8. Round to whole minutes, assign remainder to highest-priority context

**Decision**: Implement as pure function `calculateAllocations(contexts, sessionMinutes)` in `lib/allocation.ts`.

**Rationale**:
- Pure function enables easy testing and debugging
- No side effects; returns allocation result with any warnings
- Can be called repeatedly as user adjusts session duration

**Alternatives Considered**:
- Implementing in store reducer - Rejected; allocation is computation, not state mutation
- Using external scheduling library - Rejected; overkill for proportional distribution

---

### UI Components

**Finding**: Need dialog-based session setup flow.

**Component Structure**:
- `SessionSetupDialog` - Main dialog with duration input and preview
- `SessionDurationInput` - Input field with validation (minutes or h:mm format)
- `AllocationPreview` - Visual display of per-context allocations
- `OverCommitWarning` - Alert when minimums exceed session time

**Decision**: Use shadcn/ui Dialog, Input, Alert components. Keep components focused and composable.

**Rationale**: Follows existing patterns in the codebase. Dialog provides non-blocking confirmation flow per Constitution Principle I.

**Alternatives Considered**:
- Full-page setup view - Rejected; dialog maintains context and is consistent with other features
- Inline form in sidebar - Rejected; too cramped for preview display

---

### Duration Input Format

**Finding**: Need to support both minutes and hours:minutes format per FR-001.

**Decision**: Accept both formats in input, display consistently as "Xh Ym".

**Parsing Logic**:
- If contains ":" → parse as h:mm (e.g., "2:30" → 150 minutes)
- If numeric → treat as minutes
- Validate range: 1-720 minutes (12 hours max)

**Rationale**: Flexible input reduces friction; consistent display aids understanding.

---

### Rounding Strategy

**Finding**: Proportional distribution produces fractional minutes.

**Decision**: Round each allocation to nearest integer. Sum allocations; if total ≠ session time, adjust highest-priority context by the difference.

**Rationale**: Ensures total always equals session time. Highest-priority context is most likely to absorb small adjustments without issue.

**Alternatives Considered**:
- Floor all, distribute remainder - More complex, similar outcome
- Truncate fractional minutes - Loses time

---

## Summary

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Store infrastructure | Use existing | Session, ContextAllocation types already defined |
| Algorithm location | Pure function in lib/allocation.ts | Testable, no side effects |
| UI structure | Dialog with preview | Follows existing patterns, Constitution compliant |
| Input format | Accept minutes or h:mm | User flexibility |
| Rounding | Nearest + adjust highest priority | Guarantees total equals session time |
