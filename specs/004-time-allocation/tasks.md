# Tasks: Time Allocation Engine

**Input**: Design documents from `/specs/004-time-allocation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router (single project)
- **Components**: `app/components/session/` for new session components
- **Library**: `lib/` for allocation algorithm and types
- **UI Components**: `components/ui/` for shadcn/ui components (existing)

---

## Phase 1: Setup

**Purpose**: Create directory structure and new type definitions

- [x] T001 Create app/components/session/ directory for session management components
- [x] T002 Add AllocationResult, AllocationWarning, AllocationInput types to lib/allocation.ts

---

## Phase 2: Foundational (Core Algorithm)

**Purpose**: Implement the allocation algorithm that all user stories depend on

**⚠️ CRITICAL**: User story UI work cannot begin until the core algorithm is complete

- [x] T003 Implement calculateAllocations() function skeleton in lib/allocation.ts
- [x] T004 Implement Step 1: Check for zero contexts and return NO_CONTEXTS warning in lib/allocation.ts
- [x] T005 Implement Step 2: Sum all minimums and check for over-commitment in lib/allocation.ts
- [x] T006 Implement Step 3: Allocate minimums to each context in lib/allocation.ts
- [x] T007 Implement Step 4: Calculate remaining time and weight ratios in lib/allocation.ts
- [x] T008 Implement Step 5: Distribute remaining time by weight ratio in lib/allocation.ts
- [x] T009 Implement Step 6: Enforce maximum caps with redistribution loop in lib/allocation.ts
- [x] T010 Implement Step 7: Round to whole minutes and adjust highest-priority for total match in lib/allocation.ts
- [x] T011 Add parseDuration() helper to parse minutes or h:mm format in lib/allocation.ts
- [x] T012 Add formatDuration() helper to display time as "Xh Ym" in lib/allocation.ts

**Checkpoint**: Algorithm ready - UI components can now be implemented

---

## Phase 3: User Story 1 - Setup Session with Available Time (Priority: P1) 🎯 MVP

**Goal**: Users can enter session duration and the system validates and accepts it

**Independent Test**: Enter "240" or "4:00" and verify it shows "4h 0m" as total session time

### Implementation for User Story 1

- [x] T013 [P] [US1] Create SessionDurationInput component skeleton in app/components/session/SessionDurationInput.tsx
- [x] T014 [US1] Implement duration input field with placeholder in app/components/session/SessionDurationInput.tsx
- [x] T015 [US1] Add input validation (1-720 minutes range) in app/components/session/SessionDurationInput.tsx
- [x] T016 [US1] Add parsing for both minutes and h:mm format in app/components/session/SessionDurationInput.tsx
- [x] T017 [US1] Display parsed time as "Xh Ym" format in app/components/session/SessionDurationInput.tsx
- [x] T018 [US1] Show validation error for invalid input in app/components/session/SessionDurationInput.tsx

**Checkpoint**: Duration input works and validates. Ready for preview integration.

---

## Phase 4: User Story 2 - Preview Time Allocations Before Starting (Priority: P1)

**Goal**: Users see allocation preview and can confirm to start session

**Independent Test**: Enter session time with multiple contexts, verify preview shows correct allocations totaling session time

### Implementation for User Story 2

- [x] T019 [P] [US2] Create AllocationPreview component skeleton in app/components/session/AllocationPreview.tsx
- [x] T020 [US2] Display list of contexts with allocated time in app/components/session/AllocationPreview.tsx
- [x] T021 [US2] Show total allocated time validation (must equal session time) in app/components/session/AllocationPreview.tsx
- [x] T022 [US2] Add visual progress bars for allocation percentages in app/components/session/AllocationPreview.tsx
- [x] T023 [P] [US2] Create SessionSetupDialog component skeleton in app/components/session/SessionSetupDialog.tsx
- [x] T024 [US2] Integrate SessionDurationInput into SessionSetupDialog in app/components/session/SessionSetupDialog.tsx
- [x] T025 [US2] Call calculateAllocations() when duration changes in app/components/session/SessionSetupDialog.tsx
- [x] T026 [US2] Display AllocationPreview with calculated allocations in app/components/session/SessionSetupDialog.tsx
- [x] T027 [US2] Add "Start Session" confirm button that calls startSession() in app/components/session/SessionSetupDialog.tsx
- [x] T028 [US2] Add "Cancel" button to close dialog in app/components/session/SessionSetupDialog.tsx
- [x] T029 [US2] Add "Start Session" button trigger to app/page.tsx that opens SessionSetupDialog

**Checkpoint**: Complete session setup flow works. User can enter time, see preview, and start session.

---

## Phase 5: User Story 3+4+5 - Algorithm Constraints (Priority: P2)

**Goal**: Minimum durations, weight distribution, and maximum caps work correctly

**Independent Test**: Create contexts with various min/max/weight settings and verify allocations match expected values from quickstart.md scenarios

**Note**: These stories are algorithm-level and were implemented in Phase 2. This phase verifies UI correctly displays the results.

### Implementation for User Stories 3, 4, 5

- [x] T030 [US3] Verify AllocationPreview shows minimum durations are met in app/components/session/AllocationPreview.tsx
- [x] T031 [US4] Add weight percentage display to each context row in app/components/session/AllocationPreview.tsx
- [x] T032 [US5] Add visual indicator when context is capped at maximum in app/components/session/AllocationPreview.tsx

**Checkpoint**: Algorithm constraints are visually communicated in the preview.

---

## Phase 6: User Story 6 - Equal Distribution Fallback (Priority: P3)

**Goal**: Default contexts with no constraints get equal time

**Independent Test**: Create 4 contexts with default settings (weight=1, no min/max), verify equal distribution

### Implementation for User Story 6

- [x] T033 [US6] Verify equal distribution displays correctly when all weights are equal in app/components/session/AllocationPreview.tsx

**Checkpoint**: Equal distribution fallback works.

---

## Phase 7: User Story 7 - Handle Over-Committed Minimums (Priority: P3)

**Goal**: When minimums exceed session time, show warning with options

**Independent Test**: Set minimums that total more than session time, verify warning appears with actionable options

### Implementation for User Story 7

- [x] T034 [P] [US7] Create OverCommitWarning component skeleton in app/components/session/OverCommitWarning.tsx
- [x] T035 [US7] Display warning message with excess minutes in app/components/session/OverCommitWarning.tsx
- [x] T036 [US7] Add "Extend Time" option that updates duration input in app/components/session/OverCommitWarning.tsx
- [x] T037 [US7] Add "Proceed Anyway" option for proportional reduction in app/components/session/OverCommitWarning.tsx
- [x] T038 [US7] Integrate OverCommitWarning into SessionSetupDialog when warning exists in app/components/session/SessionSetupDialog.tsx

**Checkpoint**: Over-committed warning flow works with actionable options.

---

## Phase 8: User Story 8 - Handle Zero Contexts (Priority: P3)

**Goal**: When no contexts exist, show helpful guidance instead of empty preview

**Independent Test**: Delete all contexts, attempt to start session, verify helpful message appears

### Implementation for User Story 8

- [x] T039 [P] [US8] Create NoContextsMessage component in app/components/session/NoContextsMessage.tsx
- [x] T040 [US8] Display message explaining at least one context is required in app/components/session/NoContextsMessage.tsx
- [x] T041 [US8] Add button to navigate to context creation in app/components/session/NoContextsMessage.tsx
- [x] T042 [US8] Integrate NoContextsMessage into SessionSetupDialog when no contexts in app/components/session/SessionSetupDialog.tsx

**Checkpoint**: Zero contexts case handled gracefully with guidance.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Add keyboard support (Enter to confirm, Escape to cancel) in SessionSetupDialog
- [x] T044 [P] Ensure all interactive elements have proper ARIA labels in session components
- [x] T045 [P] Add loading/calculating state indicator when recalculating allocations
- [x] T046 Run `pnpm lint` and fix any linting errors
- [x] T047 Run `pnpm build` and verify no build errors
- [x] T048 Validate against quickstart.md test scenarios manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on US1 (needs duration input)
- **User Stories 3-6 (Phases 5-6)**: Depend on US2 (need preview display)
- **User Stories 7-8 (Phases 7-8)**: Depend on US2 (need dialog structure)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US1 (Duration Input) | Foundational | - |
| US2 (Preview) | US1 | - |
| US3-US5 (Constraints) | US2 | US6, US7, US8 |
| US6 (Equal Dist) | US2 | US3-5, US7, US8 |
| US7 (Over-Commit) | US2 | US3-6, US8 |
| US8 (Zero Contexts) | US2 | US3-7 |

### Within Each User Story

- Component skeleton before implementation
- Input components before display components
- Display components before integration
- Core implementation before polish

### Parallel Opportunities Per Phase

**Phase 2 (Foundational)**:
```
T003-T012 must be sequential (algorithm steps build on each other)
```

**Phase 4 (US2)**:
```
T019 and T023 can run in parallel (different component files)
```

**Phase 7-8 (US7 + US8)**:
```
After US2 complete:
- T034-T038 (US7) and T039-T042 (US8) can run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational algorithm (T003-T012)
3. Complete Phase 3: User Story 1 - Duration Input (T013-T018)
4. Complete Phase 4: User Story 2 - Preview and Dialog (T019-T029)
5. **STOP and VALIDATE**: Test session setup → preview → start flow
6. This delivers: Enter time, see allocations, start session

### Incremental Delivery

1. Setup + Foundational → Algorithm ready
2. Add US1 → Duration input works → **Partial MVP**
3. Add US2 → Full session setup flow → **Full MVP checkpoint**
4. Add US3-6 → Constraint visualization complete
5. Add US7-8 → Edge case handling complete
6. Polish → Accessibility + validation → **Production ready**

### Single Developer Strategy

Recommended execution order:
1. T001-T002 (Setup)
2. T003-T012 sequentially (Foundational - algorithm steps)
3. T013-T018 sequentially (US1 - duration input)
4. T019-T029 sequentially (US2 - preview and dialog)
5. T030-T033 (US3-6 - constraint visualization)
6. T034-T042 (US7-8 can interleave)
7. T043-T048 (Polish)

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Setup | 2 | None |
| Foundational | 10 | None (sequential algorithm) |
| US1: Duration Input | 6 | 1 (skeleton) |
| US2: Preview | 11 | 2 (component skeletons) |
| US3-5: Constraints | 3 | All 3 (different aspects) |
| US6: Equal Dist | 1 | With US3-5, US7, US8 |
| US7: Over-Commit | 5 | With US6, US8 |
| US8: Zero Contexts | 4 | With US6, US7 |
| Polish | 6 | 3 (marked [P]) |
| **Total** | **48** | |

---

## Notes

- All store actions exist (`startSession`, `endSession`, etc.) - UI components only
- Session and ContextAllocation types exist in lib/types.ts
- shadcn/ui Dialog, Input, Alert, Progress components available
- Algorithm is the core deliverable - UI is presentation layer
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
