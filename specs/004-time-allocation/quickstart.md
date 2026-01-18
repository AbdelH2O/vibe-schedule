# Quickstart: Time Allocation Engine

**Feature**: 004-time-allocation
**Date**: 2026-01-18

## Prerequisites

- Node.js 18+
- pnpm installed
- Previous phases completed (contexts and tasks working)

## Setup

```bash
# Checkout feature branch
git checkout 004-time-allocation

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/allocation.ts` | Pure function for time allocation algorithm |
| `app/components/session/SessionSetupDialog.tsx` | Main dialog for session configuration |
| `app/components/session/AllocationPreview.tsx` | Visual display of allocations |
| `app/components/session/SessionDurationInput.tsx` | Duration input with validation |
| `app/components/session/OverCommitWarning.tsx` | Warning for constraint violations |

## Testing Scenarios

### Scenario 1: Equal Distribution (Basic)

1. Create 3 contexts with default settings (weight=1, no min/max)
2. Click "Start Session"
3. Enter 90 minutes
4. **Expected**: Preview shows 30 minutes each

### Scenario 2: Weight-Based Distribution

1. Create Context A (weight=3) and Context B (weight=1)
2. Start session with 120 minutes
3. **Expected**: A=90 min (75%), B=30 min (25%)

### Scenario 3: Minimum Duration Guarantee

1. Create Context A (min=60) and Context B (no constraints)
2. Start session with 90 minutes
3. **Expected**: A=60 min (minimum), B=30 min (remaining)

### Scenario 4: Maximum Cap with Redistribution

1. Create Context A (max=45, weight=10) and Context B (weight=1)
2. Start session with 120 minutes
3. **Expected**: A=45 min (capped), B=75 min (remaining)

### Scenario 5: Over-Committed Warning

1. Create Context A (min=60) and Context B (min=90)
2. Start session with 120 minutes
3. **Expected**: Warning shows "minimums exceed by 30 minutes"
4. Options: extend time, proceed with proportional reduction

### Scenario 6: Zero Contexts

1. Delete all contexts
2. Attempt to start session
3. **Expected**: Message "Create a context first" with button to create

### Scenario 7: Duration Input Formats

1. Enter "2:30" → **Expected**: Parses to 150 minutes
2. Enter "90" → **Expected**: Parses to 90 minutes
3. Enter "0" → **Expected**: Validation error
4. Enter "800" → **Expected**: Validation error (max 720)

## Validation Commands

```bash
# Check for linting errors
pnpm lint

# Verify build succeeds
pnpm build

# Run dev server for manual testing
pnpm dev
```

## Implementation Order

1. `lib/allocation.ts` - Core algorithm (no UI dependencies)
2. `SessionDurationInput.tsx` - Input component
3. `AllocationPreview.tsx` - Display component
4. `OverCommitWarning.tsx` - Warning component
5. `SessionSetupDialog.tsx` - Compose all components
6. Integration in `app/page.tsx` - Add "Start Session" trigger

## Algorithm Reference

```
1. If no contexts → return NO_CONTEXTS warning
2. Sum all minimums
3. If sum > sessionTime → return OVER_COMMITTED warning
4. Allocate minimums to each context
5. remainingTime = sessionTime - sumOfMinimums
6. Calculate weight ratios
7. Distribute remainingTime by ratio
8. For each context where allocated > max:
   a. Cap at max
   b. Collect excess
9. Redistribute excess to uncapped contexts (repeat until stable)
10. Round to whole minutes, adjust highest-priority for total match
11. Return allocations
```
