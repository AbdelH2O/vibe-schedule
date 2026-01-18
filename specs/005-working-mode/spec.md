# Feature Specification: Working Mode

**Feature Branch**: `005-working-mode`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Phase 5: Working Mode - Focused execution phase with session lifecycle, context tracking, time transfers, and task completion"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Work Session (Priority: P1)

As a user who has defined contexts with time allocations, I want to start a focused work session so that I can begin executing my planned work with clear time boundaries.

After entering my available session time and previewing allocations (handled by Phase 4), I click "Start Session" to transition from Definition Mode to Working Mode. The system activates my highest-priority context and begins tracking time.

**Why this priority**: This is the foundational capability of Working Mode. Without session activation, no other Working Mode features can function. Users need to transition into an active work state to begin productive sessions.

**Independent Test**: Can be fully tested by configuring contexts with allocations, starting a session, and verifying the mode transitions to Working with the highest-priority context active.

**Acceptance Scenarios**:

1. **Given** contexts exist with time allocations calculated, **When** user clicks "Start Session", **Then** the system transitions to Working Mode with session status "active"
2. **Given** a session is starting, **When** contexts have different priorities, **Then** the context with the highest priority (lowest priority number) becomes active first
3. **Given** a session has started, **When** viewing the interface, **Then** the session start time is recorded and a countdown timer is visible for the active context
4. **Given** Working Mode is active, **When** user attempts to edit contexts or tasks, **Then** structural changes are prevented (read-only mode for organization)

---

### User Story 2 - Track Active Context Time (Priority: P1)

As a user in an active work session, I want to see a countdown timer for my current context so that I know how much allocated time remains for this focus area.

While working, I see a prominent timer showing minutes remaining for the active context. The timer counts down in real-time. I can also see the overall session time remaining.

**Why this priority**: Time visibility is essential for Working Mode's core value proposition. Users need immediate feedback on time consumption to manage their work session effectively.

**Independent Test**: Can be fully tested by starting a session and observing the timer counting down accurately, with both context-specific and session-wide time displays.

**Acceptance Scenarios**:

1. **Given** a context is active, **When** time passes, **Then** the context timer decrements in real-time showing minutes and seconds remaining
2. **Given** a context is active, **When** viewing the session, **Then** total session time remaining is also visible
3. **Given** a context has used all allocated time, **When** the timer reaches zero, **Then** the user receives a visual/audio notification that context time is exhausted
4. **Given** a context timer reaches zero, **When** user is still working, **Then** the system allows continued work but indicates overtime status

---

### User Story 3 - Switch Between Contexts (Priority: P1)

As a user working on a task, I want to switch to a different context at any time so that I can adapt my focus based on changing priorities or energy levels.

At any point during my session, I can select a different context to work on. When I switch, the time I've used on the current context is logged, and the new context becomes active with its own countdown timer.

**Why this priority**: Context switching is a core differentiator of vibe-schedule. Users must be able to fluidly move between focus areas while the system accurately tracks time per context.

**Independent Test**: Can be fully tested by starting a session, working in one context, switching to another, and verifying time tracking transfers correctly.

**Acceptance Scenarios**:

1. **Given** an active session with multiple contexts, **When** user selects a different context, **Then** the current context's used time is updated and the new context becomes active
2. **Given** user switches to a new context, **When** the switch occurs, **Then** the new context's countdown timer starts from its remaining allocated time
3. **Given** a context has been partially used, **When** user switches away and returns later, **Then** the timer resumes from the remaining time (not reset)
4. **Given** user switches contexts, **When** viewing the context list, **Then** all contexts show their current used/remaining time status

---

### User Story 4 - View and Complete Tasks (Priority: P2)

As a user working within a context, I want to see only the tasks belonging to my current context so that I can focus on relevant work without distraction, and mark tasks complete as I finish them.

When I'm working in a context, the task list shows only tasks assigned to that context. I can check off tasks as I complete them. Completed tasks remain visible but are visually distinguished.

**Why this priority**: Task visibility and completion are essential for productive work but depend on having an active session with context tracking already functioning.

**Independent Test**: Can be fully tested by creating tasks in a context, starting a session, switching to that context, and marking tasks complete.

**Acceptance Scenarios**:

1. **Given** an active context during a session, **When** viewing tasks, **Then** only tasks assigned to that context are displayed
2. **Given** tasks are visible for active context, **When** user marks a task as complete, **Then** the task shows completed status with visual distinction (strikethrough, checkmark)
3. **Given** a task is marked complete, **When** viewing the task list, **Then** the task remains visible until session ends (not hidden immediately)
4. **Given** Working Mode is active, **When** user attempts to add/edit/delete tasks, **Then** these actions are prevented (tasks are read-only except for completion status)

---

### User Story 5 - End Session Manually (Priority: P2)

As a user who has finished working, I want to end my session manually so that I can wrap up before all allocated time is used and see a summary of my work.

At any point, I can click "End Session" to stop the work session. The system calculates final time usage per context and transitions back to Definition Mode.

**Why this priority**: Manual session termination is necessary for real-world use where users don't always exhaust their time. It enables graceful exits and prepares for summary display.

**Independent Test**: Can be fully tested by starting a session, working for some time, ending the session early, and verifying the mode transitions back to Definition.

**Acceptance Scenarios**:

1. **Given** an active session, **When** user clicks "End Session", **Then** the session status changes to "completed" and the system transitions to Definition Mode
2. **Given** user ends session, **When** transition occurs, **Then** final time usage is calculated and saved for all contexts
3. **Given** session is ending, **When** user confirms end action, **Then** a confirmation prompt appears to prevent accidental termination
4. **Given** session has ended, **When** in Definition Mode, **Then** task completion status persists (completed tasks remain completed)

---

### User Story 6 - Session Auto-Complete (Priority: P2)

As a user who has used all session time, I want the session to end automatically so that I receive clear notification that my work period is complete.

When the total session time is exhausted (all context timers at zero or total session time depleted), the session automatically ends with a clear completion notification.

**Why this priority**: Automatic completion ensures sessions have a definitive end state, preventing confusion about whether time remains.

**Independent Test**: Can be fully tested by starting a short session and letting time run out, verifying automatic transition to completed state.

**Acceptance Scenarios**:

1. **Given** total session time is exhausted, **When** all allocated time is used, **Then** the session automatically transitions to "completed" status
2. **Given** session auto-completes, **When** the event occurs, **Then** user receives a prominent notification (visual/audio) indicating session end
3. **Given** session has auto-completed, **When** viewing the interface, **Then** the system returns to Definition Mode

---

### User Story 7 - View Session Summary (Priority: P3)

As a user who has completed a session, I want to see a summary of how I spent my time so that I can reflect on my work patterns and improve future planning.

After a session ends (manually or automatically), I see a summary showing time spent per context, tasks completed, and how actual time compared to allocated time.

**Why this priority**: Session summaries provide valuable feedback but are not essential for core session execution. They enhance the experience after the primary workflow is complete.

**Independent Test**: Can be fully tested by completing a session and viewing the resulting summary display.

**Acceptance Scenarios**:

1. **Given** a session has just ended, **When** viewing the summary, **Then** each context shows allocated time vs. actual time used
2. **Given** a session summary is displayed, **When** tasks were completed, **Then** the count of completed tasks is shown
3. **Given** session summary is visible, **When** user dismisses it, **Then** the summary closes and full Definition Mode interface is restored

---

### User Story 8 - Pause and Resume Session (Priority: P3)

As a user who needs to take a break, I want to pause my session so that the timer stops while I'm away and I can resume where I left off.

During an active session, I can pause the countdown timers. The session remains in Working Mode but time stops accumulating. I can resume when ready.

**Why this priority**: Pause/resume is a convenience feature that improves real-world usability but is not essential for core session functionality.

**Independent Test**: Can be fully tested by starting a session, pausing it, waiting, resuming, and verifying time only accumulated during active periods.

**Acceptance Scenarios**:

1. **Given** an active session, **When** user clicks "Pause", **Then** all timers stop and session status changes to "paused"
2. **Given** a paused session, **When** user clicks "Resume", **Then** timers resume from where they stopped and status returns to "active"
3. **Given** session is paused, **When** viewing the interface, **Then** a clear visual indicator shows paused state
4. **Given** session is paused, **When** time passes, **Then** no time is deducted from any context allocation

---

### Edge Cases

- What happens when a user starts a session with only one context? The single context becomes active and receives all allocated time.
- What happens when a context has zero allocated time? The context appears but shows zero remaining; user can still switch to it for tracking purposes but timer shows 0:00.
- What happens if the browser/tab closes during an active session? Session state is persisted; upon return, user can resume or end the interrupted session.
- What happens if all contexts have depleted their time but session time remains? User can continue working in overtime mode on any context.
- How does system handle very short sessions (under 1 minute)? Minimum tracking granularity is seconds; short sessions are valid.
- What happens to inbox tasks during Working Mode? Inbox tasks are not visible; only context-assigned tasks appear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST transition from Definition Mode to Working Mode when user starts a session
- **FR-002**: System MUST automatically select the highest-priority context as active when session begins
- **FR-003**: System MUST display a real-time countdown timer for the active context's remaining time
- **FR-004**: System MUST display the total session time remaining alongside context time
- **FR-005**: System MUST allow users to switch between contexts at any time during a session
- **FR-006**: System MUST accurately track cumulative time used per context across multiple activations
- **FR-007**: System MUST persist time tracking data when switching contexts
- **FR-008**: System MUST filter displayed tasks to show only those belonging to the active context
- **FR-009**: System MUST allow users to mark tasks as complete during Working Mode
- **FR-010**: System MUST prevent structural changes (add/edit/delete contexts or tasks) during Working Mode
- **FR-011**: System MUST allow manual session termination via "End Session" action
- **FR-012**: System MUST display a confirmation prompt before ending a session
- **FR-013**: System MUST automatically end the session when total allocated time is exhausted
- **FR-014**: System MUST provide visual/audio notification when context time or session time is depleted
- **FR-015**: System MUST display a session summary upon session completion
- **FR-016**: System MUST support pausing and resuming an active session
- **FR-017**: System MUST persist session state to survive browser refresh or tab close
- **FR-018**: System MUST return to Definition Mode when session ends

### Key Entities

- **Session**: Represents an active work period with total duration, start time, status (active/paused/completed), and references to context allocations. One session exists at a time.
- **ContextAllocation**: Tracks allocated minutes and used minutes for each context within a session. Updated when time passes or user switches contexts.
- **Active Context**: The currently focused context receiving time accumulation. Only one context can be active at a time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start a work session and be actively working within a context in under 5 seconds after clicking "Start Session"
- **SC-002**: Context switch latency is imperceptible (under 200ms perceived delay)
- **SC-003**: Timer accuracy maintains less than 1 second drift per hour of session time
- **SC-004**: 95% of users successfully complete a full session (start to end) without encountering blocking errors
- **SC-005**: Session state survives browser refresh with no data loss
- **SC-006**: Users can identify active context and remaining time at a glance without additional clicks
- **SC-007**: Task completion during Working Mode persists correctly to Definition Mode after session ends

## Assumptions

- Phase 4 (Time Allocation Engine) is complete and provides the session setup dialog with calculated allocations
- The allocation algorithm from Phase 4 has already distributed time across contexts before session starts
- Users have at least one context defined before attempting to start a session
- Browser supports localStorage for session persistence
- Timer precision of 1-second intervals is sufficient for user experience
