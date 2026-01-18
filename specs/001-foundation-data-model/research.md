# Research: Foundation & Data Model

**Feature**: 001-foundation-data-model
**Date**: 2026-01-18

## Research Summary

All technical decisions were clarified during the specification phase. This document captures best practices and patterns for the chosen technologies.

## Decision Log

### 1. State Management: React Context API

**Decision**: Use React Context API for global state management

**Rationale**:
- Built into React 19 - zero additional dependencies
- Sufficient for single-user, localStorage-backed application
- Simpler mental model than external libraries (Zustand, Redux)
- Direct integration with React's component lifecycle

**Alternatives Considered**:
- Zustand: Rejected - adds dependency for marginal benefit at this scale
- Redux: Rejected - excessive boilerplate for simple state shape
- Prop drilling: Rejected - would make component tree unwieldy

**Implementation Pattern**:
```typescript
// Provider wraps app in layout.tsx
// useStore() hook provides access to state and actions
// Reducer pattern for predictable state updates
```

### 2. Persistence: localStorage with SSR Safety

**Decision**: Use browser localStorage with SSR-aware utilities

**Rationale**:
- No backend required - fully client-side
- Instant persistence - no network latency
- Works offline by default
- Simple JSON serialization

**Best Practices Applied**:
- Check `typeof window !== 'undefined'` before localStorage access
- Use try-catch for all storage operations (quota, permissions)
- Provide fallback to in-memory state when storage unavailable
- Include migration safety with nullish coalescing for missing fields

**Storage Key**: `vibe-schedule-state`

### 3. Type System: TypeScript Strict Mode

**Decision**: TypeScript with strict mode enabled

**Rationale**:
- Catch errors at compile time rather than runtime
- Self-documenting code through type annotations
- IDE support for refactoring and autocomplete
- Aligns with constitution Principle IV (Simplicity First)

**Type Design Patterns**:
- All entities have `id`, `createdAt`, `updatedAt` fields
- Optional fields use `?` modifier
- Discriminated unions for mode/status enums
- Explicit `Omit<>` types for create operations

### 4. Priority Scale: 1-5 (1 = Highest)

**Decision**: Use numeric 1-5 scale where 1 is highest priority

**Rationale**:
- Intuitive: "priority 1" commonly understood as top priority
- Easy to sort: ascending order = highest priority first
- Flexible: allows future interpolation if needed

**Note**: Existing code comment says "higher = more important" - this needs correction to align with spec.

### 5. Duration Units: Minutes

**Decision**: Store all durations as integer minutes

**Rationale**:
- Natural unit for productivity sessions (30 min, 60 min, 90 min)
- Simple arithmetic for time calculations
- Easy display conversion (90 min → "1h 30m")
- Avoids floating-point precision issues

### 6. Important Dates: Array per Context

**Decision**: Each context can have multiple important dates

**Rationale**:
- Supports multiple milestones (sprint end, review, deadline)
- Each date has label + date for countdown display
- Aligns with constitution Principle III (Flexible Constraints)

**Structure**:
```typescript
importantDates?: ImportantDate[];
// where ImportantDate = { id, label, date }
```

## Existing Implementation Analysis

The `lib/` directory already contains implementation:

| File | Status | Notes |
|------|--------|-------|
| `lib/types.ts` | 95% complete | Fix priority comment (1=highest, not higher=more) |
| `lib/storage.ts` | 100% complete | SSR-safe, error handling, migration safety |
| `lib/store.tsx` | 99% complete | Fix: move useState import to top |

## No Outstanding Research Items

All NEEDS CLARIFICATION items were resolved during `/speckit.clarify`:
- ✅ Session entity scope
- ✅ State management approach
- ✅ Important dates structure
- ✅ Duration units
- ✅ Priority scale representation
