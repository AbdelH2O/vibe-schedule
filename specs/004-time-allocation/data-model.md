# Data Model: Time Allocation Engine

**Feature**: 004-time-allocation
**Date**: 2026-01-18

## Existing Entities (No Changes Required)

The following types already exist in `lib/types.ts` and fully support this feature:

### Session

```typescript
interface Session {
  id: string;
  totalDuration: number;           // Total session time in minutes
  startedAt: string;               // ISO timestamp
  allocations: ContextAllocation[];
  activeContextId: string | null;
  contextStartedAt: string | null;
  status: 'active' | 'paused' | 'completed';
}
```

### ContextAllocation

```typescript
interface ContextAllocation {
  contextId: string;
  allocatedMinutes: number;        // Time assigned by algorithm
  usedMinutes: number;             // Time consumed during session
}
```

### Context (Relevant Fields)

```typescript
interface Context {
  id: string;
  name: string;
  priority: number;      // 1-5, used for suggested work order
  minDuration?: number;  // Guaranteed minimum allocation
  maxDuration?: number;  // Maximum cap
  weight: number;        // Proportional distribution factor
  // ... other fields
}
```

## New Types (lib/allocation.ts)

### AllocationResult

Result of the allocation algorithm. Contains calculated allocations plus any warnings.

```typescript
interface AllocationResult {
  allocations: ContextAllocation[];
  totalAllocated: number;
  warnings: AllocationWarning[];
  isValid: boolean;
}
```

### AllocationWarning

Warnings generated during allocation (e.g., over-committed minimums).

```typescript
type AllocationWarningType =
  | 'over_committed_minimums'    // Sum of minimums > session time
  | 'under_utilized_maximums'    // Sum of maximums < session time
  | 'no_contexts';               // No contexts to allocate

interface AllocationWarning {
  type: AllocationWarningType;
  message: string;
  details?: {
    excessMinutes?: number;      // For over_committed
    unusedMinutes?: number;      // For under_utilized
  };
}
```

### AllocationInput

Input to the allocation function.

```typescript
interface AllocationInput {
  contexts: Pick<Context, 'id' | 'priority' | 'minDuration' | 'maxDuration' | 'weight'>[];
  sessionMinutes: number;
}
```

## Relationships

```
Session 1 ←→ * ContextAllocation
  ↓
ContextAllocation * ←→ 1 Context
```

- One session contains allocations for all contexts
- Each allocation references exactly one context by ID
- Contexts can exist without allocations (before session starts)

## State Transitions

### Session Lifecycle

```
[No Session] → calculateAllocations() → [Preview]
    ↓                                        ↓
    ←←←←←←←← cancel ←←←←←←←←←←←←←←←←←←←←←←←←
                                             ↓
                                         confirm
                                             ↓
                                      startSession()
                                             ↓
                                        [Active]
                                             ↓
                                        endSession()
                                             ↓
                                       [No Session]
```

### Allocation Recalculation

Preview recalculates whenever:
- Session duration changes
- User navigates back from warning screen
- (Future) Context constraints change during setup

## Validation Rules

| Rule | Enforcement | Error Handling |
|------|-------------|----------------|
| Session duration 1-720 minutes | Input validation | Block submission, show error |
| At least one context required | Algorithm check | Return warning, disable confirm |
| Minimums exceed session time | Algorithm check | Return warning, offer options |
| All allocations sum to session time | Algorithm guarantee | Rounding adjustment |
| allocatedMinutes ≥ 0 | Algorithm guarantee | Always true by construction |
