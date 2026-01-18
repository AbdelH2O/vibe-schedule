# Feature Specification: Tasks & Inbox

**Feature Branch**: `003-tasks-inbox`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Tasks & Inbox: Users can create tasks and organize them into contexts or the inbox staging area (Phase 3 from implementation plan)"

## Clarifications

### Session 2026-01-18

- Q: Should users be able to mark tasks as complete while in Working Mode? → A: Yes, completion toggle allowed in Working Mode (creation/editing still restricted)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and View Tasks (Priority: P1)

As a user, I want to create tasks so that I can capture work items I need to complete.

**Why this priority**: Task creation is the fundamental capability of this feature. Without it, no other task-related functionality is possible. This enables users to capture actionable items for their work.

**Independent Test**: Can be fully tested by creating a task, verifying it appears in the list, and checking that it persists across page reloads. Delivers the core value of task capture.

**Acceptance Scenarios**:

1. **Given** I am in Definition Mode, **When** I enter a task title and submit, **Then** the task is created and appears in my task list
2. **Given** I have created tasks, **When** I refresh the page, **Then** all my tasks appear exactly as I left them
3. **Given** I am viewing the application, **When** I look at a task, **Then** I can see its title, completion status, and deadline (if set)

---

### User Story 2 - Inbox as Staging Area (Priority: P1)

As a user, I want new tasks to land in an Inbox by default so that I can quickly capture ideas without deciding where they belong yet.

**Why this priority**: The Inbox concept is central to the vibe-schedule design philosophy - allowing quick capture without organizational overhead. This enables frictionless task entry.

**Independent Test**: Can be tested by creating a task without assigning a context and verifying it appears in the Inbox view.

**Acceptance Scenarios**:

1. **Given** I create a task without assigning a context, **When** the task is created, **Then** it appears in the Inbox
2. **Given** I have tasks in the Inbox, **When** I view the Inbox, **Then** I see all unassigned tasks
3. **Given** I am viewing the Inbox, **When** I look at the task count, **Then** it accurately reflects the number of unassigned tasks

---

### User Story 3 - Assign Tasks to Contexts (Priority: P2)

As a user, I want to assign tasks to contexts so that I know what work belongs to each focus area.

**Why this priority**: Context assignment connects tasks to the broader time-allocation system. Without this, tasks remain orphaned and disconnected from the core scheduling workflow.

**Independent Test**: Can be tested by assigning an Inbox task to a context and verifying it moves from Inbox to the context's task list.

**Acceptance Scenarios**:

1. **Given** I have a task in the Inbox, **When** I assign it to a context, **Then** the task moves from Inbox to that context's task list
2. **Given** I am creating a new task, **When** I select a context during creation, **Then** the task is created directly in that context (not Inbox)
3. **Given** I have a task in a context, **When** I want to move it, **Then** I can reassign it to a different context or back to Inbox

---

### User Story 4 - Mark Tasks Complete (Priority: P2)

As a user, I want to mark tasks as complete so that I can track my progress.

**Why this priority**: Completion tracking is essential for productivity. It provides the satisfaction of progress and helps users understand what work remains.

**Independent Test**: Can be tested by marking a task complete and verifying the status persists across page reloads.

**Acceptance Scenarios**:

1. **Given** I have an incomplete task, **When** I mark it complete, **Then** the task shows a completed status
2. **Given** I have a completed task, **When** I want to undo, **Then** I can mark it incomplete again
3. **Given** I have marked tasks complete, **When** I refresh the page, **Then** the completion status is preserved

---

### User Story 5 - View Tasks Per Context (Priority: P2)

As a user, I want to see tasks organized by context so that I can focus on work within a specific area.

**Why this priority**: Context-based task views are essential for the working mode where users focus on one context at a time. This enables focused work sessions.

**Independent Test**: Can be tested by creating tasks in multiple contexts and verifying each context shows only its assigned tasks.

**Acceptance Scenarios**:

1. **Given** I select a context, **When** I view its details, **Then** I see only the tasks assigned to that context
2. **Given** a context has no tasks, **When** I view it, **Then** I see an empty state message indicating no tasks
3. **Given** I have tasks in multiple contexts, **When** I switch between contexts, **Then** each shows its own distinct task list

---

### User Story 6 - Add Task Deadline (Priority: P3)

As a user, I want to optionally add deadlines to tasks so that I can see time-sensitive items at a glance.

**Why this priority**: Deadlines are informational indicators in vibe-schedule (not scheduling drivers). This adds helpful context but is not essential for core functionality.

**Independent Test**: Can be tested by setting a deadline on a task and verifying it displays correctly.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I set a deadline, **Then** the deadline is saved and displayed
2. **Given** a task has a deadline, **When** I view the task, **Then** I can see when it's due
3. **Given** a task has a deadline, **When** I want to remove it, **Then** I can clear the deadline

---

### User Story 7 - Delete Tasks (Priority: P3)

As a user, I want to delete tasks I no longer need so that I can keep my lists clean.

**Why this priority**: Deletion is a housekeeping feature. Users can work around this by marking tasks complete, but direct deletion provides cleaner task management.

**Independent Test**: Can be tested by deleting a task and verifying it no longer appears in any view.

**Acceptance Scenarios**:

1. **Given** I have a task, **When** I delete it, **Then** the task is permanently removed
2. **Given** I delete a task from a context, **When** I view that context, **Then** the task count decreases
3. **Given** I am about to delete a task, **When** I initiate deletion, **Then** I see a confirmation to prevent accidental deletions

---

### Edge Cases

- What happens when a context is deleted that has tasks assigned to it? Tasks should move to Inbox.
- What happens when trying to assign a task to a context that no longer exists? System should prevent this or reassign to Inbox.
- How does the system handle very long task titles? Titles should truncate visually but store the full text.
- What happens with empty task titles? System should prevent creating tasks with empty or whitespace-only titles.
- What if deadline is set in the past? System should allow it (user may be recording already-late tasks) but may visually indicate overdue status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create tasks with at least a title
- **FR-002**: System MUST place new tasks in the Inbox when no context is specified
- **FR-003**: System MUST allow tasks to be assigned to any existing context during creation or editing
- **FR-004**: System MUST display an Inbox view showing all unassigned tasks
- **FR-005**: System MUST display task lists within each context view
- **FR-006**: System MUST allow users to mark tasks as complete or incomplete
- **FR-007**: System MUST persist task completion status across page reloads
- **FR-008**: System MUST allow users to move tasks between contexts and Inbox
- **FR-009**: System MUST allow users to add optional deadlines to tasks
- **FR-010**: System MUST display task deadlines when present
- **FR-011**: System MUST allow users to edit task titles
- **FR-012**: System MUST allow users to delete tasks with confirmation
- **FR-013**: System MUST move tasks to Inbox when their assigned context is deleted
- **FR-014**: System MUST prevent creation of tasks with empty titles
- **FR-015**: System MUST display task count indicators for contexts and Inbox
- **FR-016**: System MUST show an empty state message when a context or Inbox has no tasks
- **FR-017**: System MUST restrict task creation and editing to Definition Mode only; however, marking tasks complete/incomplete is allowed in both Definition Mode and Working Mode

### Key Entities

- **Task**: Represents an individual item of work. Contains a title (required), completion status, optional deadline for informational display, and an optional context assignment. Tasks without a context assignment reside in the Inbox.

- **Inbox**: A virtual container for unassigned tasks. The Inbox is not a stored entity but rather a view of all tasks where contextId is null. It serves as a staging area for quick capture.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a task and see it appear in the appropriate list within 1 second
- **SC-002**: Task data persists correctly across 100% of page refreshes
- **SC-003**: Users can complete the full task lifecycle (create, assign, complete, delete) without errors
- **SC-004**: Context task lists accurately reflect only their assigned tasks with 100% accuracy
- **SC-005**: Inbox accurately shows all unassigned tasks at all times
- **SC-006**: Task completion state toggles correctly and persists across sessions
- **SC-007**: Users can create, edit, and delete tasks without navigating away from their current view

## Assumptions

- The Context entity and context management UI already exist (Phase 2 completed)
- Local storage persistence utilities are available (Phase 1 completed)
- React Context API state management is in place (Phase 1 completed)
- The Task type is already defined with the structure: id, title, contextId (null for inbox), deadline (optional), completed, createdAt, updatedAt

## Dependencies

- **001-foundation-data-model**: Provides the Task type definition and storage utilities
- **002-context-management**: Provides the Context entity and context CRUD operations that tasks reference
