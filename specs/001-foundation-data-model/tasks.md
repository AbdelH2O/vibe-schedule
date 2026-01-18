# Tasks: Foundation & Data Model

**Input**: Design documents from `/specs/001-foundation-data-model/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for pages and components
- **Data Layer**: `lib/` for types, storage, and state
- Paths are relative to repository root `/home/station/Documents/vibe-schedule/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate existing project setup and fix any issues

- [x] T001 Verify project dependencies with `pnpm install` at repository root
- [x] T002 Fix useState import ordering in lib/store.tsx (move from line 389 to top with other React imports)
- [x] T003 Update priority comment in lib/types.ts (change "higher = more important" to "1 = highest priority, 5 = lowest")

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create app/components/ directory structure

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create components directory at app/components/
- [x] T005 Update app/layout.tsx to wrap children with StoreProvider from lib/store.tsx
- [x] T006 Update app/layout.tsx metadata (title: "Vibe-Schedule", description: "Context-driven productivity system")

**Checkpoint**: Foundation ready - StoreProvider integrated, user story implementation can now begin

---

## Phase 3: User Story 1 - Application State Persists Across Sessions (Priority: P1) 🎯 MVP

**Goal**: Data persists correctly when user closes and reopens browser

**Independent Test**:
1. Open app, manually add test data via browser console using `useStore()` actions
2. Refresh page - data should persist
3. Clear localStorage - app shows empty state without crash
4. Corrupt localStorage value - app recovers gracefully

### Implementation for User Story 1

- [x] T007 [US1] Create client wrapper component at app/components/ClientProvider.tsx that handles hydration state display
- [x] T008 [US1] Update app/page.tsx to use ClientProvider and show loading state during hydration
- [x] T009 [US1] Verify localStorage persistence by running `pnpm dev` and testing in browser DevTools

**Checkpoint**: User Story 1 complete - data persists across page refreshes, app recovers from corrupted data

---

## Phase 4: User Story 2 - Application Shell Provides Clear Navigation (Priority: P2)

**Goal**: Clear application layout with distinct areas for navigation and content

**Independent Test**:
1. Load app and verify header, sidebar, and main content areas are visible
2. Resize browser to mobile viewport - layout should remain usable
3. Verify all areas are visually distinct

### Implementation for User Story 2

- [x] T010 [P] [US2] Create Sidebar component at app/components/Sidebar.tsx with empty state placeholder
- [x] T011 [P] [US2] Create Header component at app/components/Header.tsx with app title "Vibe-Schedule"
- [x] T012 [US2] Create AppShell component at app/components/AppShell.tsx that composes Header, Sidebar, and main content area
- [x] T013 [US2] Update app/page.tsx to render AppShell as main content
- [x] T014 [US2] Add responsive styles to AppShell for mobile viewport (sidebar collapses or slides)

**Checkpoint**: User Story 2 complete - clear layout visible on desktop and mobile

---

## Phase 5: User Story 3 - Mode State Indicates Current Activity (Priority: P3)

**Goal**: User can see whether they're in Definition Mode or Working Mode

**Independent Test**:
1. Load app - mode indicator shows "Definition Mode"
2. (Future: switch modes) - indicator updates
3. Refresh page - mode indicator persists (shows same mode as before)

### Implementation for User Story 3

- [x] T015 [US3] Create ModeIndicator component at app/components/ModeIndicator.tsx with visual distinction between modes
- [x] T016 [US3] Integrate ModeIndicator into Header component at app/components/Header.tsx
- [x] T017 [US3] Add accessible ARIA labels to ModeIndicator for screen readers
- [x] T018 [US3] Verify mode state persists by switching mode (via console), refreshing, and checking indicator

**Checkpoint**: User Story 3 complete - mode indicator visible and persists across refreshes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T019 Run `pnpm lint` and fix any ESLint errors
- [x] T020 Run `pnpm build` and verify production build succeeds with no TypeScript errors
- [x] T021 Test complete flow: open app, verify shell layout, verify mode indicator, refresh and verify persistence
- [x] T022 Test error recovery: corrupt localStorage value, refresh, verify app recovers to empty state
- [x] T023 Test mobile responsiveness: resize browser to mobile viewport, verify layout works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories should proceed sequentially in priority order (P1 → P2 → P3)
  - Each story builds on the previous shell structure
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Enables data persistence
- **User Story 2 (P2)**: Depends on US1 for ClientProvider pattern - Adds shell layout
- **User Story 3 (P3)**: Depends on US2 for Header component - Adds mode indicator to header

### Within Each User Story

- Components before integration
- Core implementation before styling refinements
- Story complete before moving to next priority

### Parallel Opportunities

Within Phase 4 (User Story 2):
- T010 (Sidebar.tsx) and T011 (Header.tsx) can run in parallel - different files

---

## Parallel Example: User Story 2

```bash
# Launch Sidebar and Header creation in parallel:
Task: "Create Sidebar component at app/components/Sidebar.tsx"
Task: "Create Header component at app/components/Header.tsx"

# Then compose them:
Task: "Create AppShell component at app/components/AppShell.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (fix existing code)
2. Complete Phase 2: Foundational (StoreProvider integration)
3. Complete Phase 3: User Story 1 (persistence verification)
4. **STOP and VALIDATE**: Test data persistence works
5. Continue to User Story 2 (shell layout)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test persistence → Checkpoint (data layer works!)
3. Add User Story 2 → Test layout → Checkpoint (visual structure!)
4. Add User Story 3 → Test mode indicator → Checkpoint (full Phase 1 complete!)
5. Each story adds visible value without breaking previous stories

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Setup | T001-T003 | Fix existing code issues |
| 2. Foundational | T004-T006 | StoreProvider integration |
| 3. US1 (P1) | T007-T009 | Data persistence |
| 4. US2 (P2) | T010-T014 | Shell layout |
| 5. US3 (P3) | T015-T018 | Mode indicator |
| 6. Polish | T019-T023 | Verification and cleanup |

**Total Tasks**: 23
**Parallel Opportunities**: 2 (T010+T011 in Phase 4)
**MVP Scope**: Complete through User Story 1 (T001-T009, 9 tasks)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently verifiable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Existing lib/ code is mostly complete; focus is on UI integration
