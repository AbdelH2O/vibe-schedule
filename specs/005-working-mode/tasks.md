# Tasks: Working Mode

**Input**: Design documents from `/specs/005-working-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing per verification strategy (pnpm lint, pnpm build)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses Next.js App Router structure:
- **Components**: `app/components/`
- **Library code**: `lib/`
- **UI primitives**: `components/ui/` (shadcn)

---

## Phase 1: Setup

**Purpose**: Create directory structure and shared utilities for Working Mode

- [x] T001 Create working components directory at app/components/working/
- [x] T002 [P] Create timer utilities module at lib/timer.ts with formatTime and calculateRemainingSeconds functions
- [x] T003 [P] Create audio notification utility at lib/notifications.ts with playChime and playCompletion functions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update SessionSetupDialog to sort allocations by priority before calling startSession in app/components/session/SessionSetupDialog.tsx
- [x] T005 Create WorkingModeView container component at app/components/working/WorkingModeView.tsx (empty shell with layout structure)
- [x] T006 Update app/page.tsx to conditionally render WorkingModeView when state.mode === 'working'

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Start a Work Session (Priority: P1) 🎯 MVP

**Goal**: User can start a session and transition to Working Mode with highest-priority context active

**Independent Test**: Configure contexts, start session via SessionSetupDialog, verify mode transitions to Working with correct context active

### Implementation for User Story 1

- [x] T007 [US1] Create ContextTimer component at app/components/working/ContextTimer.tsx displaying countdown MM:SS format
- [x] T008 [US1] Create ActiveContextPanel component at app/components/working/ActiveContextPanel.tsx showing context name and timer
- [x] T009 [US1] Integrate ActiveContextPanel into WorkingModeView at app/components/working/WorkingModeView.tsx
- [x] T010 [US1] Add read-only mode enforcement in WorkingModeView (hide add/edit/delete buttons on contexts and tasks)
- [x] T011 [US1] Verify session start transition works end-to-end (manual test and lint/build)

**Checkpoint**: User Story 1 complete - can start session, see active context with timer, structure is read-only

---

## Phase 4: User Story 2 - Track Active Context Time (Priority: P1)

**Goal**: Real-time countdown timer for context and session with overtime indication

**Independent Test**: Start session, observe timer counting down, let timer reach zero, verify overtime visual indicator

### Implementation for User Story 2

- [x] T012 [US2] Implement setInterval timer logic in ContextTimer with 1-second tick at app/components/working/ContextTimer.tsx
- [x] T013 [US2] Add overtime visual state to ContextTimer (red tint, +MM:SS format when remaining < 0)
- [x] T014 [US2] Create SessionTimer component at app/components/working/SessionTimer.tsx showing total session time remaining
- [x] T015 [US2] Integrate SessionTimer into WorkingModeView header at app/components/working/WorkingModeView.tsx
- [x] T016 [US2] Add visual notification (flash/pulse) when context timer reaches zero in ContextTimer
- [x] T017 [US2] Add audio notification when context timer reaches zero using lib/notifications.ts

**Checkpoint**: User Story 2 complete - timers count down accurately, overtime indicated visually/audibly

---

## Phase 5: User Story 3 - Switch Between Contexts (Priority: P1)

**Goal**: User can switch contexts with time transfer; cumulative tracking across activations

**Independent Test**: Start session with multiple contexts, switch between them, verify time accumulates correctly per context

### Implementation for User Story 3

- [x] T018 [US3] Create ContextSwitcher component at app/components/working/ContextSwitcher.tsx listing all contexts with time status
- [x] T019 [US3] Implement handleSwitchContext function in ContextSwitcher calculating elapsed time and calling switchContext action
- [x] T020 [US3] Integrate ContextSwitcher into WorkingModeView sidebar at app/components/working/WorkingModeView.tsx
- [x] T021 [US3] Add visual highlight for active context in ContextSwitcher
- [x] T022 [US3] Display used/remaining time per context in ContextSwitcher list items

**Checkpoint**: User Story 3 complete - can switch contexts fluidly, time tracked per context

---

## Phase 6: User Story 4 - View and Complete Tasks (Priority: P2)

**Goal**: Display tasks filtered by active context; allow marking tasks complete

**Independent Test**: Create tasks in contexts, start session, verify only active context tasks shown, mark tasks complete

### Implementation for User Story 4

- [x] T023 [P] [US4] Create WorkingTaskItem component at app/components/working/WorkingTaskItem.tsx with checkbox for completion
- [x] T024 [US4] Create WorkingTaskList component at app/components/working/WorkingTaskList.tsx filtering tasks by activeContextId
- [x] T025 [US4] Integrate WorkingTaskList into WorkingModeView main content at app/components/working/WorkingModeView.tsx
- [x] T026 [US4] Add visual styling for completed tasks (strikethrough, muted color) in WorkingTaskItem
- [x] T027 [US4] Wire toggleTaskCompleted store action to WorkingTaskItem checkbox

**Checkpoint**: User Story 4 complete - tasks filtered by context, completion works and persists

---

## Phase 7: User Story 5 - End Session Manually (Priority: P2)

**Goal**: User can end session with confirmation; returns to Definition Mode

**Independent Test**: Start session, work for some time, click End Session, confirm, verify return to Definition Mode

### Implementation for User Story 5

- [x] T028 [P] [US5] Create EndSessionDialog component at app/components/working/EndSessionDialog.tsx with confirmation prompt
- [x] T029 [US5] Create SessionControls component at app/components/working/SessionControls.tsx with End Session button
- [x] T030 [US5] Integrate SessionControls into WorkingModeView footer at app/components/working/WorkingModeView.tsx
- [x] T031 [US5] Wire EndSessionDialog to endSession store action with pre-end time update
- [x] T032 [US5] Verify task completion status persists after session ends

**Checkpoint**: User Story 5 complete - can end session manually, mode returns to Definition

---

## Phase 8: User Story 6 - Session Auto-Complete (Priority: P2)

**Goal**: Session ends automatically when total time exhausted with notification

**Independent Test**: Start short session (1-2 minutes), let time run out, verify auto-transition to Definition Mode

### Implementation for User Story 6

- [x] T033 [US6] Add session exhaustion check to timer tick logic in WorkingModeView or SessionTimer
- [x] T034 [US6] Trigger endSession action automatically when session time reaches zero
- [x] T035 [US6] Add completion audio notification using lib/notifications.ts when session auto-completes
- [x] T036 [US6] Add visual notification (toast/banner) on session auto-completion

**Checkpoint**: User Story 6 complete - session auto-ends when time exhausted

---

## Phase 9: User Story 7 - View Session Summary (Priority: P3)

**Goal**: Display summary after session ends showing time per context and tasks completed

**Independent Test**: Complete a session, verify summary modal appears with correct allocations and task counts

### Implementation for User Story 7

- [x] T037 [US7] Create SessionSummary component at app/components/working/SessionSummary.tsx displaying time breakdown
- [x] T038 [US7] Calculate summary data from final session state before endSession clears it
- [x] T039 [US7] Add tasks completed count to SessionSummary (per context and total)
- [x] T040 [US7] Show SessionSummary modal on session completion (before mode transition)
- [x] T041 [US7] Add dismiss button to SessionSummary that completes transition to Definition Mode

**Checkpoint**: User Story 7 complete - summary shown after session with useful stats

---

## Phase 10: User Story 8 - Pause and Resume Session (Priority: P3)

**Goal**: User can pause timers during breaks and resume without losing progress

**Independent Test**: Start session, pause, wait, resume, verify time only accumulated during active periods

### Implementation for User Story 8

- [x] T042 [US8] Add Pause/Resume button to SessionControls at app/components/working/SessionControls.tsx
- [x] T043 [US8] Wire pauseSession and resumeSession store actions to Pause/Resume button
- [x] T044 [US8] Update ContextTimer to stop ticking when session.status === 'paused'
- [x] T045 [US8] Add visual paused state indicator to WorkingModeView (banner or overlay)
- [x] T046 [US8] Ensure SessionTimer also respects paused state

**Checkpoint**: User Story 8 complete - pause/resume works correctly

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Refinements that affect multiple user stories

- [x] T047 Add keyboard shortcuts for common actions (space to pause/resume, escape to open end dialog)
- [x] T048 Add session recovery dialog for browser refresh during active session
- [x] T049 [P] Ensure all Working Mode components have proper TypeScript interfaces
- [x] T050 [P] Add ARIA labels and keyboard navigation to all interactive elements
- [x] T051 Run pnpm lint and fix any issues
- [x] T052 Run pnpm build and verify production build succeeds
- [x] T053 Run quickstart.md validation checklist manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - US1, US2, US3 (P1 priority) should complete first - core functionality
  - US4, US5, US6 (P2 priority) can follow
  - US7, US8 (P3 priority) are enhancements
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|-----------|-----------------|
| US1 - Start Session | Foundational | Phase 2 |
| US2 - Track Time | US1 (needs timer base) | T007-T009 |
| US3 - Switch Contexts | US1, US2 (needs active timer) | T012 |
| US4 - Tasks | US1 (needs working mode) | T009 |
| US5 - End Session | US1 (needs session) | T009 |
| US6 - Auto-Complete | US2 (needs timer logic) | T012 |
| US7 - Summary | US5 (needs end flow) | T031 |
| US8 - Pause/Resume | US2 (needs timer) | T012 |

### Parallel Opportunities

- T002, T003 (Setup utilities) can run in parallel
- T023, T028 (WorkingTaskItem, EndSessionDialog) can run in parallel
- T049, T050 (TypeScript, ARIA) can run in parallel

---

## Parallel Example: Setup Phase

```bash
# Launch in parallel:
Task: "Create timer utilities module at lib/timer.ts"
Task: "Create audio notification utility at lib/notifications.ts"
```

## Parallel Example: US4 and US5

```bash
# After US3 complete, these can run in parallel:
Task: "Create WorkingTaskItem component"  # [US4]
Task: "Create EndSessionDialog component"  # [US5]
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Start Session
4. Complete Phase 4: User Story 2 - Track Time
5. Complete Phase 5: User Story 3 - Switch Contexts
6. **STOP and VALIDATE**: Working Mode MVP functional
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Can enter Working Mode (MVP!)
3. Add US2 → Timers work correctly
4. Add US3 → Context switching works
5. Add US4 → Task visibility and completion
6. Add US5 → Manual session ending
7. Add US6 → Auto-completion
8. Add US7 → Summary display
9. Add US8 → Pause/resume convenience

### Suggested Stop Points

- **After US3**: Minimal viable Working Mode (can start, track time, switch contexts)
- **After US6**: Complete core functionality (sessions can end)
- **After US8**: Full feature set with polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Existing store actions handle most state updates - just wire UI to them
- Timer uses Date.now() calculation to compensate for JavaScript drift
- Commit after each task or logical group
- Run lint/build frequently to catch issues early
