# Tasks: Definition Mode - Context Management

**Input**: Design documents from `/specs/002-context-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in specification - manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js App Router)**: `app/` for pages/components, `components/ui/` for shadcn, `lib/` for utilities
- New context components: `app/components/contexts/`
- Shared components: `app/components/shared/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install required shadcn/ui components and create directory structure

- [x] T001 Add shadcn/ui Label component via `pnpm dlx shadcn@latest add label`
- [x] T002 [P] Add shadcn/ui Select component via `pnpm dlx shadcn@latest add select`
- [x] T003 [P] Add shadcn/ui AlertDialog component via `pnpm dlx shadcn@latest add alert-dialog`
- [x] T004 Create directory structure: `app/components/contexts/` and `app/components/shared/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utility components and helper functions needed by multiple user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create date utility functions (getDaysRemaining, formatCountdown) in `lib/dates.ts`
- [x] T006 [P] Create EmptyState component for empty list guidance in `app/components/shared/EmptyState.tsx`
- [x] T007 [P] Create ConfirmDialog component using AlertDialog in `app/components/shared/ConfirmDialog.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create a New Context (Priority: P1) 🎯 MVP

**Goal**: Users can create a context with a name via a form, and it appears in the sidebar

**Independent Test**: Create a context named "Deep Work", verify it appears in sidebar, refresh page, verify persistence

### Implementation for User Story 1

- [x] T008 [US1] Create ContextForm component with name input and validation in `app/components/contexts/ContextForm.tsx`
- [x] T009 [US1] Create ContextListItem component for displaying a single context in sidebar in `app/components/contexts/ContextListItem.tsx`
- [x] T010 [US1] Create ContextList component that maps contexts to ContextListItem in `app/components/contexts/ContextList.tsx`
- [x] T011 [US1] Integrate ContextList into Sidebar, replacing placeholder context navigation in `app/components/Sidebar.tsx`
- [x] T012 [US1] Add "New Context" button to sidebar that opens ContextForm in `app/components/Sidebar.tsx`
- [x] T013 [US1] Connect ContextForm to store addContext action in `app/components/contexts/ContextForm.tsx`
- [x] T014 [US1] Verify: run `pnpm lint && pnpm build` and manual test create + persistence

**Checkpoint**: User Story 1 complete - users can create contexts and see them in sidebar

---

## Phase 4: User Story 5 - View Context List (Priority: P1)

**Goal**: Users see all contexts in sidebar with priority indicators and deadline warnings

**Independent Test**: Create 5 contexts with different priorities and important dates, verify all display correctly in sidebar

### Implementation for User Story 5

- [x] T015 [US5] Add priority indicator badge (1-5) to ContextListItem in `app/components/contexts/ContextListItem.tsx`
- [x] T016 [US5] Add upcoming deadline indicator (≤7 days) to ContextListItem using date utils in `app/components/contexts/ContextListItem.tsx`
- [x] T017 [US5] Handle long context names with truncation and title tooltip in `app/components/contexts/ContextListItem.tsx`
- [x] T018 [US5] Make ContextList scrollable for 10+ contexts in `app/components/contexts/ContextList.tsx`
- [x] T019 [US5] Show EmptyState when no contexts exist in `app/components/contexts/ContextList.tsx`
- [x] T020 [US5] Verify: run `pnpm lint && pnpm build` and manual test list display

**Checkpoint**: User Story 5 complete - full context list with visual indicators

---

## Phase 5: User Story 6 - View Context Details (Priority: P2)

**Goal**: Users can select a context and see all its properties in a detail view

**Independent Test**: Select a context with all properties set, verify all display correctly in main content area

### Implementation for User Story 6

- [x] T021 [US6] Add selectedContextId state to manage active context selection in `app/page.tsx`
- [x] T022 [US6] Make ContextListItem clickable to select context in `app/components/contexts/ContextListItem.tsx`
- [x] T023 [P] [US6] Create ImportantDateList component showing dates with countdown badges in `app/components/contexts/ImportantDateList.tsx`
- [x] T024 [US6] Create ContextDetail component displaying all context properties in `app/components/contexts/ContextDetail.tsx`
- [x] T025 [US6] Integrate ContextDetail into main content area of page.tsx in `app/page.tsx`
- [x] T026 [US6] Show appropriate empty states for unset optional fields in `app/components/contexts/ContextDetail.tsx`
- [x] T027 [US6] Verify: run `pnpm lint && pnpm build` and manual test detail view

**Checkpoint**: User Story 6 complete - users can view full context details

---

## Phase 6: User Story 2 - Set Context Properties (Priority: P2)

**Goal**: Users can set all context properties (priority, durations, weight, important dates) during creation or editing

**Independent Test**: Create/edit a context, set all properties, verify values saved and displayed correctly

### Implementation for User Story 2

- [x] T028 [US2] Add priority Select (1-5) to ContextForm with labels in `app/components/contexts/ContextForm.tsx`
- [x] T029 [US2] Add minDuration and maxDuration number inputs to ContextForm in `app/components/contexts/ContextForm.tsx`
- [x] T030 [US2] Add weight number input (decimal allowed) to ContextForm in `app/components/contexts/ContextForm.tsx`
- [x] T031 [US2] Add validation: min ≤ max duration when both set in `app/components/contexts/ContextForm.tsx`
- [x] T032 [P] [US2] Create ImportantDateForm component for adding dates in `app/components/contexts/ImportantDateForm.tsx`
- [x] T033 [US2] Integrate ImportantDateForm into ContextForm for managing dates array in `app/components/contexts/ContextForm.tsx`
- [x] T034 [US2] Display inline validation errors in ContextForm in `app/components/contexts/ContextForm.tsx`
- [x] T035 [US2] Verify: run `pnpm lint && pnpm build` and manual test all property inputs

**Checkpoint**: User Story 2 complete - all context properties can be set

---

## Phase 7: User Story 3 - Edit an Existing Context (Priority: P2)

**Goal**: Users can modify any property of an existing context and changes persist

**Independent Test**: Edit a context's name and properties, verify changes appear everywhere and persist after refresh

### Implementation for User Story 3

- [x] T036 [US3] Add edit button to ContextDetail that opens ContextForm with existing data in `app/components/contexts/ContextDetail.tsx`
- [x] T037 [US3] Modify ContextForm to accept initialData prop for edit mode in `app/components/contexts/ContextForm.tsx`
- [x] T038 [US3] Connect ContextForm edit mode to store updateContext action in `app/components/contexts/ContextForm.tsx`
- [x] T039 [US3] Update ImportantDateList to support removing dates in `app/components/contexts/ImportantDateList.tsx`
- [x] T040 [US3] Verify: run `pnpm lint && pnpm build` and manual test edit + persistence

**Checkpoint**: User Story 3 complete - contexts can be fully edited

---

## Phase 8: User Story 4 - Delete a Context (Priority: P3)

**Goal**: Users can delete a context with confirmation, and tasks move to Inbox

**Independent Test**: Delete a context with tasks, verify context removed, tasks in Inbox, persists after refresh

### Implementation for User Story 4

- [x] T041 [US4] Add delete button to ContextDetail in `app/components/contexts/ContextDetail.tsx`
- [x] T042 [US4] Wire delete button to ConfirmDialog with context name in message in `app/components/contexts/ContextDetail.tsx`
- [x] T043 [US4] Connect confirmed deletion to store deleteContext action in `app/components/contexts/ContextDetail.tsx`
- [x] T044 [US4] Clear selectedContextId after deletion in `app/page.tsx`
- [x] T045 [US4] Verify: run `pnpm lint && pnpm build` and manual test delete + task reassignment

**Checkpoint**: User Story 4 complete - contexts can be deleted safely

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T046 Add keyboard navigation (Enter to submit, Escape to cancel) to ContextForm in `app/components/contexts/ContextForm.tsx`
- [x] T047 [P] Add ARIA labels for accessibility to all interactive elements in `app/components/contexts/`
- [x] T048 [P] Ensure responsive design works on mobile viewport in `app/components/contexts/`
- [x] T049 Final build verification: run `pnpm lint && pnpm build` and fix any issues
- [x] T050 Run quickstart.md validation: follow all developer setup steps end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - Can proceed in priority order (P1 → P2 → P3)
  - US1 and US5 are both P1 and can run in parallel
  - US2, US3, US6 are P2 and can run after P1 stories
  - US4 is P3 and runs last
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation → US1 (no story dependencies)
- **User Story 5 (P1)**: Foundation → US1 → US5 (needs ContextListItem from US1)
- **User Story 6 (P2)**: Foundation → US1 → US6 (needs list infrastructure)
- **User Story 2 (P2)**: Foundation → US1 → US2 (extends ContextForm)
- **User Story 3 (P2)**: US2 → US6 → US3 (needs form with all fields + detail view)
- **User Story 4 (P3)**: US6 → US4 (needs detail view for delete button)

### Parallel Opportunities

- T002, T003 can run in parallel (different shadcn components)
- T006, T007 can run in parallel (different shared components)
- T023 can run in parallel with T021, T022 (independent component)
- T032 can run in parallel with T028-T031 (separate form component)
- T047, T048 can run in parallel (different concerns)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch shadcn component installs together:
Task: "Add shadcn/ui Select component via pnpm dlx shadcn@latest add select"
Task: "Add shadcn/ui AlertDialog component via pnpm dlx shadcn@latest add alert-dialog"
```

## Parallel Example: Phase 2 Foundational

```bash
# Launch shared components together:
Task: "Create EmptyState component in app/components/shared/EmptyState.tsx"
Task: "Create ConfirmDialog component in app/components/shared/ConfirmDialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 5 Only)

1. Complete Phase 1: Setup (4 tasks)
2. Complete Phase 2: Foundational (3 tasks)
3. Complete Phase 3: User Story 1 - Create Context (7 tasks)
4. Complete Phase 4: User Story 5 - View List (6 tasks)
5. **STOP and VALIDATE**: Test creating and viewing contexts
6. Deploy/demo if ready - users can create and browse contexts

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 + US5 → Create and view contexts (MVP!)
3. Add US6 → View context details
4. Add US2 → Set all properties
5. Add US3 → Edit contexts
6. Add US4 → Delete contexts
7. Add Polish → Accessibility and final cleanup

---

## Summary

| Phase | Story | Tasks | Parallel Tasks |
|-------|-------|-------|----------------|
| 1 - Setup | - | 4 | 2 |
| 2 - Foundational | - | 3 | 2 |
| 3 - Create Context | US1 | 7 | 0 |
| 4 - View List | US5 | 6 | 0 |
| 5 - View Details | US6 | 7 | 1 |
| 6 - Set Properties | US2 | 8 | 1 |
| 7 - Edit Context | US3 | 5 | 0 |
| 8 - Delete Context | US4 | 5 | 0 |
| 9 - Polish | - | 5 | 2 |
| **Total** | | **50** | **8** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Existing store actions (addContext, updateContext, deleteContext) are already implemented in Phase 1
