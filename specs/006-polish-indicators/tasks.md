# Tasks: Polish & Indicators

**Input**: Design documents from `/specs/006-polish-indicators/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router
- **Components**: `app/components/`
- **Utilities**: `lib/`
- **UI Components**: `components/ui/` (shadcn)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared dependencies and utilities needed across multiple user stories

- [x] T001 Add shadcn/ui Progress component via `pnpm dlx shadcn@latest add progress`
- [x] T002 [P] Add shadcn/ui Sonner (toast) component via `pnpm dlx shadcn@latest add sonner`
- [x] T003 [P] Add DeadlineUrgency and TimeProgress types to lib/types.ts
- [x] T004 Add getDeadlineUrgency utility function to lib/dates.ts
- [x] T005 Add formatCountdownWithUrgency utility function to lib/dates.ts
- [x] T006 [P] Add getTimeProgress utility function to lib/dates.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before user story implementation

**⚠️ CRITICAL**: User stories depend on these utilities being available

- [x] T007 Add urgency color mapping helper (getUrgencyColorClass) to lib/utils.ts
- [x] T008 [P] Add animation keyframes for pulse-slow and fade-in to app/globals.css
- [x] T009 Run `pnpm lint` to verify setup changes compile correctly

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Deadline Countdown Indicators (Priority: P1) 🎯 MVP

**Goal**: Display human-readable countdown indicators with urgency styling for context important dates and task deadlines

**Independent Test**: Create contexts with important dates at various intervals (overdue, today, tomorrow, 2 weeks) and tasks with deadlines; verify countdown badges display with correct urgency colors

### Implementation for User Story 1

- [x] T010 [P] [US1] Create CountdownBadge component in app/components/shared/CountdownBadge.tsx
- [x] T011 [US1] Update ContextListItem to display countdown badge for nearest important date in app/components/contexts/ContextListItem.tsx
- [x] T012 [US1] Update ContextDetail to display countdown for each important date in app/components/contexts/ContextDetail.tsx
- [x] T013 [US1] Update TaskListItem to display deadline countdown with urgency styling in app/components/tasks/TaskListItem.tsx
- [x] T014 [US1] Run `pnpm lint` and `pnpm build` to verify User Story 1 compiles

**Checkpoint**: Deadline countdown indicators fully functional and independently testable

---

## Phase 4: User Story 2 - Time Remaining Visualizations (Priority: P1)

**Goal**: Display progress bars with threshold-based styling for context and session time during Working Mode

**Independent Test**: Start a work session, let time elapse, verify progress bars update and change color at 75%, 90%, and 100% thresholds

### Implementation for User Story 2

- [x] T015 [P] [US2] Create TimeProgressBar component in app/components/shared/TimeProgressBar.tsx
- [x] T016 [US2] Add progress bar to ContextTimer in app/components/working/ContextTimer.tsx
- [x] T017 [US2] Add progress bar to SessionTimer in app/components/working/SessionTimer.tsx
- [x] T018 [US2] Update ContextSwitcher to show progress for each context allocation in app/components/working/ContextSwitcher.tsx
- [x] T019 [US2] Add overtime pulsing animation to timers when time exhausted
- [x] T020 [US2] Ensure progress bars pause when session is paused
- [x] T021 [US2] Run `pnpm lint` and `pnpm build` to verify User Story 2 compiles

**Checkpoint**: Time visualizations fully functional and independently testable

---

## Phase 5: User Story 3 - Mode Transition Feedback (Priority: P2)

**Goal**: Provide smooth visual transitions and accessibility announcements when switching between Definition and Working modes

**Independent Test**: Start and end work sessions, verify animations play, screen reader announces mode changes

### Implementation for User Story 3

- [x] T022 [P] [US3] Add transition classes to AppShell layout containers in app/components/AppShell.tsx
- [x] T023 [US3] Add entry animation to ModeIndicator in app/components/ModeIndicator.tsx
- [x] T024 [US3] Add aria-live region for mode announcements in app/page.tsx
- [x] T025 [US3] Add visual indicator when editing is disabled in Working Mode (N/A - WorkingModeView is a separate view without edit buttons)
- [x] T026 [US3] Run `pnpm lint` and `pnpm build` to verify User Story 3 compiles

**Checkpoint**: Mode transitions provide clear visual and audio feedback

---

## Phase 6: User Story 4 - Empty State Guidance (Priority: P2)

**Goal**: Display contextual empty states with illustrations and actionable CTAs for all empty areas

**Independent Test**: Clear localStorage, verify empty states appear with appropriate guidance and actions work

### Implementation for User Story 4

- [x] T027 [P] [US4] Enhance EmptyState component with icon/illustration support in app/components/shared/EmptyState.tsx
- [x] T028 [US4] Update Sidebar to show enhanced empty state when no contexts in app/components/Sidebar.tsx
- [x] T029 [US4] Update ContextDetail to show enhanced empty state when no tasks in app/components/contexts/ContextDetail.tsx
- [x] T030 [US4] Add empty state for inbox view (if applicable) in app/components/tasks/TaskList.tsx
- [x] T031 [US4] Add empty state when session cannot start (no contexts available)
- [x] T032 [US4] Run `pnpm lint` and `pnpm build` to verify User Story 4 compiles

**Checkpoint**: All empty areas guide users to productive actions

---

## Phase 7: User Story 5 - Responsive Design Optimization (Priority: P2)

**Goal**: Ensure layout adapts gracefully to mobile, tablet, and desktop viewports

**Independent Test**: Resize browser window through breakpoints (320px, 640px, 1024px, 1920px), verify layout adapts without horizontal scrolling

### Implementation for User Story 5

- [x] T033 [P] [US5] Add sidebar toggle state and mobile hamburger menu to Sidebar in app/components/Sidebar.tsx (already implemented)
- [x] T034 [US5] Update AppShell with responsive grid layout (mobile single-column, desktop multi-column) in app/components/AppShell.tsx (already implemented)
- [x] T035 [US5] Update WorkingModeView to stack context switcher on mobile in app/components/working/WorkingModeView.tsx (already implemented)
- [x] T036 [US5] Verify touch targets are minimum 44x44px on all interactive elements
- [x] T037 [US5] Add responsive padding/margins adjustments throughout components
- [x] T038 [US5] Run `pnpm lint` and `pnpm build` to verify User Story 5 compiles

**Checkpoint**: Application usable on all screen sizes from 320px to 2560px

---

## Phase 8: User Story 6 - Keyboard Navigation & Accessibility (Priority: P3)

**Goal**: Enable full keyboard navigation and screen reader support for all application features

**Independent Test**: Navigate entire application using only Tab/Enter/Escape keys, verify with screen reader

### Implementation for User Story 6

- [x] T039 [P] [US6] Audit and add visible focus indicators to all interactive elements
- [x] T040 [US6] Add aria-live region for timer announcements (throttled to 30s intervals) in app/components/working/SessionTimer.tsx
- [x] T041 [US6] Add screen reader announcement for task completion in app/components/working/WorkingTaskList.tsx
- [x] T042 [US6] Verify dialog focus trapping works (shadcn/ui default)
- [x] T043 [US6] Add skip-to-content link for keyboard users in app/layout.tsx
- [x] T044 [US6] Ensure color is not the only indicator (add icons/text alongside colors)
- [x] T045 [US6] Run `pnpm lint` and `pnpm build` to verify User Story 6 compiles

**Checkpoint**: Application fully operable via keyboard and screen reader

---

## Phase 9: User Story 7 - Error Handling & Recovery (Priority: P3)

**Goal**: Display clear error messages and provide recovery options for all error scenarios

**Independent Test**: Simulate error conditions (invalid input, corrupted localStorage), verify user-friendly messages appear

### Implementation for User Story 7

- [x] T046 [P] [US7] Add Toaster component to app layout in app/layout.tsx
- [x] T047 [US7] Add error boundary wrapper to main page in app/page.tsx (used Next.js error.tsx)
- [x] T048 [US7] Create ErrorFallback component for error boundary in app/components/shared/ErrorFallback.tsx
- [x] T049 [US7] Add storage error handling with toast notifications to lib/storage.ts
- [x] T050 [US7] Add data corruption detection and recovery dialog (via storage.ts validation)
- [x] T051 [US7] Enhance form validation with inline error messages (existing forms already have validation)
- [x] T052 [US7] Run `pnpm lint` and `pnpm build` to verify User Story 7 compiles

**Checkpoint**: All errors handled gracefully with recovery options

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and refinements across all user stories

- [x] T053 Run full application test via `pnpm dev` - verify all 7 user stories work
- [x] T054 Run `pnpm lint` - fix any remaining lint errors
- [x] T055 Run `pnpm build` - verify production build succeeds
- [x] T056 Test keyboard navigation flow through entire application (skip link, focus indicators added)
- [x] T057 Test responsive design at all breakpoints (320px, 640px, 1024px, 1920px)
- [x] T058 Verify all success criteria from spec.md are met
- [x] T059 Update CLAUDE.md with any new patterns or conventions used

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user stories
- **User Story 1-7 (Phases 3-9)**: All depend on Foundational phase completion
  - User stories can proceed sequentially (P1 → P1 → P2 → P2 → P2 → P3 → P3)
  - Some can be parallelized (US1 and US2 are both P1, can run in parallel)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - deadline indicators standalone
- **User Story 2 (P1)**: No dependencies on other stories - time visualizations standalone
- **User Story 3 (P2)**: No dependencies - mode transitions standalone
- **User Story 4 (P2)**: No dependencies - empty states standalone
- **User Story 5 (P2)**: May share components with US3 (AppShell) but independently testable
- **User Story 6 (P3)**: Builds on all previous stories but adds accessibility layer
- **User Story 7 (P3)**: Builds on all previous stories but adds error handling layer

### Parallel Opportunities

- **Phase 1**: T001 || T002 || T003 (shadcn components + types)
- **Phase 1**: T004, T005, T006 can run after T003 (dates.ts utilities)
- **Phase 2**: T007 || T008 (utils and CSS can be parallel)
- **User Stories**: US1 || US2 can run in parallel (both P1, different files)
- **User Stories**: US3 || US4 || US5 can run in parallel (all P2, different focus areas)
- **User Stories**: US6 || US7 can run in parallel (both P3, different concerns)

---

## Parallel Example: User Stories 1 and 2 (Both P1)

```bash
# Can launch these user stories in parallel after Foundational phase:

# User Story 1 tasks:
Task: "Create CountdownBadge component in app/components/shared/CountdownBadge.tsx"
Task: "Update ContextListItem to display countdown badge"
Task: "Update TaskListItem to display deadline countdown"

# User Story 2 tasks (parallel):
Task: "Create TimeProgressBar component in app/components/shared/TimeProgressBar.tsx"
Task: "Add progress bar to ContextTimer"
Task: "Add progress bar to SessionTimer"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (shadcn components, types, utilities)
2. Complete Phase 2: Foundational (color helpers, animations)
3. Complete Phase 3: User Story 1 - Deadline Indicators
4. Complete Phase 4: User Story 2 - Time Visualizations
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready - core visual polish complete

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 (P1 features) → MVP visual polish
3. Add US3 + US4 + US5 (P2 features) → Full polish
4. Add US6 + US7 (P3 features) → Production ready
5. Each increment adds value without breaking previous stories

### Suggested MVP Scope

**User Story 1 (Deadline Indicators) + User Story 2 (Time Visualizations)**

These two P1 stories provide the most visible improvements and can be delivered together as a meaningful MVP increment. They are independent of each other and can even be developed in parallel.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Run lint/build after each user story to catch issues early
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
