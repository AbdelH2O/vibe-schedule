# Vibe-Schedule MVP Implementation Phases

## Project Summary

A context-driven productivity system that blends task management with flexible time allocation. Users define contexts (focus areas), populate them with tasks, then start work sessions where time is dynamically distributed based on priorities and weights.

**Scope Decisions:**
- **Persistence**: Local Storage (browser-based, single device)
- **Users**: Single-user, no authentication
- **Stack**: Next.js 16, React 19, TypeScript strict, Tailwind CSS 4

---

## Phase 1: Foundation & Data Model

**Goal**: Establish core data structures and local storage persistence

- Define TypeScript types/interfaces for Context and Task entities
- Create local storage utilities (save, load, sync)
- Set up React state management (Context API or Zustand)
- App shell with basic layout structure
- Mode state: track Definition vs Working mode

**Deliverable**: Data layer ready; app skeleton running with persistence

---

## Phase 2: Definition Mode - Contexts

**Goal**: Users can create and manage contexts

- Context CRUD operations
- Context properties:
  - Name (required)
  - Priority level
  - Minimum duration (optional)
  - Maximum duration (optional)
  - Weight (optional)
  - Important dates (optional)
- Context list view
- Edit/delete functionality

**Deliverable**: Users can fully manage their contexts

---

## Phase 3: Definition Mode - Tasks & Inbox

**Goal**: Users can create tasks and organize them into contexts

- Task CRUD operations
- Inbox as staging area for unassigned tasks
- Assign/move tasks between contexts
- Task properties:
  - Title (required)
  - Context assignment (optional → Inbox if unset)
  - Deadline (optional, display only)
  - Completed status
- Task list views (per-context and inbox)

**Deliverable**: Complete Definition Mode functionality

---

## Phase 4: Time Allocation Engine

**Goal**: Implement the algorithm that distributes session time

- Session setup: input total available time
- Allocation algorithm:
  1. Sum minimum durations; allocate first
  2. Distribute remaining time proportionally by weight
  3. Apply maximum duration caps
  4. Fallback: equal distribution when no constraints
- Preview allocations before starting session
- Handle edge cases (over-committed minimums, zero contexts)

**Deliverable**: Time distribution logic working and visible

---

## Phase 5: Working Mode

**Goal**: Users can execute focused work sessions

- Session lifecycle: Start → Active → Complete
- Active context tracking with countdown timer
- Context switching: time transfers to new context
- View tasks for current context only
- Mark tasks complete while working
- Structure is read-only during session
- Session end: manual stop or time exhausted
- Basic session summary

**Deliverable**: Full working mode with time tracking

---

## Phase 6: Polish & Indicators

**Goal**: Visual refinements and production readiness

- Deadline/important date countdown indicators
- Time remaining visualizations
- Mode transition feedback
- Empty states and onboarding hints
- Responsive design
- Accessibility (keyboard navigation, ARIA labels)
- Error handling and edge case polish

**Deliverable**: Production-ready MVP

---

## Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Contexts) → Phase 3 (Tasks)
    ↓                    ↓
    └────→ Phase 4 (Time Allocation)
                 ↓
           Phase 5 (Working Mode)
                 ↓
           Phase 6 (Polish)
```

Phases 2 and 3 can run in parallel after Phase 1.

---

## Verification Strategy

After each phase:
1. Run `pnpm dev` and manually test new functionality
2. Run `pnpm lint` to ensure code quality
3. Run `pnpm build` to verify no build errors
4. Test persistence by refreshing the page
