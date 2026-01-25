# Feature Specification: Nested Task Hierarchy

**Feature Branch**: `001-nested-task-hierarchy`
**Created**: 2026-01-25
**Status**: Draft
**Input**: User description: "We should be able to group tasks under one another, any level of times we want. The tasks should open an accordion to show their children. If we click on one task, we focus on it instead (works both in the definition mode and work mode) and show a breadcrumb of how deep down we are, and should be able to navigate back up any level we want."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Child Tasks Under a Parent (Priority: P1)

A user wants to break down a complex task into smaller, manageable subtasks. They select an existing task and create a new task underneath it, establishing a parent-child relationship. The child task appears nested below its parent, and the user can continue adding more levels of subtasks as needed.

**Why this priority**: This is the foundational capability that enables all other nested task features. Without the ability to create parent-child relationships, no other functionality can work.

**Independent Test**: Can be fully tested by creating a task, then creating a child task under it, and verifying the child appears nested under the parent. Delivers immediate value by enabling task breakdown.

**Acceptance Scenarios**:

1. **Given** a task exists, **When** the user initiates "add subtask" action on that task, **Then** a new task is created with the original task as its parent
2. **Given** a parent task with child tasks exists, **When** the user initiates "add subtask" on one of the children, **Then** a grandchild task is created under that child (unlimited nesting depth)
3. **Given** multiple tasks exist, **When** a user creates subtasks under different parents, **Then** each subtask appears only under its designated parent

---

### User Story 2 - View and Expand Nested Tasks (Priority: P1)

A user has created a hierarchy of tasks and wants to see all subtasks under a parent. Parent tasks display an expand/collapse control that shows or hides their children. The user can expand multiple levels to see the full hierarchy.

**Why this priority**: Viewing nested tasks is essential alongside creating them—users need immediate visual feedback that hierarchy exists.

**Independent Test**: Can be tested by expanding a parent task with children and verifying all direct children are displayed. Collapsing should hide them.

**Acceptance Scenarios**:

1. **Given** a parent task with children exists, **When** the user expands the parent, **Then** all direct child tasks are displayed in an accordion-style expansion
2. **Given** a nested hierarchy (parent → child → grandchild), **When** the user expands the parent and then the child, **Then** both levels of nesting are visible
3. **Given** an expanded parent task, **When** the user collapses it, **Then** all child tasks are hidden from view
4. **Given** a task has no children, **When** viewing the task, **Then** no expand/collapse control is shown

---

### User Story 3 - Focus on a Task and Navigate with Breadcrumbs (Priority: P2)

A user working on a deeply nested task wants to focus on just that task and its subtasks without the distraction of sibling or ancestor tasks. They click on the task to "focus" into it, which makes that task the current root view. A breadcrumb trail shows the path from the original root to the focused task, allowing navigation back to any ancestor level.

**Why this priority**: Focus mode and breadcrumb navigation significantly improve usability for deep hierarchies but aren't strictly required to use the basic nesting feature.

**Independent Test**: Can be tested by focusing on a nested task, verifying only that task and its children are visible, then using breadcrumbs to navigate back up to any ancestor.

**Acceptance Scenarios**:

1. **Given** a nested task hierarchy, **When** the user clicks on a task's title (not checkbox or expand control), **Then** only that task and its descendants are displayed
2. **Given** a focused task at depth 3 (e.g., Project → Phase → Task), **When** viewing the breadcrumb, **Then** it shows "Root > Project > Phase > Task" (or context/inbox name at root)
3. **Given** a breadcrumb with multiple levels, **When** the user clicks on any ancestor in the breadcrumb, **Then** focus moves to that ancestor level
4. **Given** focus is on a nested task, **When** the user clicks the root element in breadcrumb, **Then** focus returns to the top-level view showing all root tasks

---

### User Story 4 - Work Mode Focus and Progress Tracking (Priority: P2)

A user enters working mode and wants to work through their tasks. When working on a parent task, they can focus into its children to work on subtasks individually. Progress on child tasks can optionally roll up to provide visibility on parent completion status.

**Why this priority**: Working mode integration ensures the feature works across both definition and working modes, but definition mode is more commonly used for organizing.

**Independent Test**: Can be tested by entering working mode, focusing on a parent task, completing child tasks, and verifying the interaction between parent and child completion.

**Acceptance Scenarios**:

1. **Given** working mode is active, **When** a parent task is displayed, **Then** the user can expand it to see child tasks
2. **Given** working mode and a nested hierarchy, **When** the user clicks to focus on a subtask, **Then** breadcrumb navigation appears showing the hierarchy path
3. **Given** a parent with 3 child tasks, **When** 2 children are marked complete, **Then** the parent shows a progress indicator (e.g., "2/3 subtasks complete")
4. **Given** all children of a parent are complete, **When** viewing the parent, **Then** the parent can be marked complete (completion is not automatic)

---

### User Story 5 - Reorder Tasks Within Hierarchy (Priority: P3)

A user wants to reorganize their task hierarchy by moving tasks between parents or reordering siblings. Drag-and-drop or move actions allow tasks to be repositioned while maintaining or changing their parent relationship.

**Why this priority**: Reorganization is an enhancement that improves workflow but basic nesting can function without it.

**Independent Test**: Can be tested by dragging a task from one parent to another (or to root level) and verifying it appears in the new location.

**Acceptance Scenarios**:

1. **Given** sibling tasks under a parent, **When** the user reorders them via drag-and-drop, **Then** the new order is preserved
2. **Given** a task nested under parent A, **When** the user moves it to parent B, **Then** the task becomes a child of parent B
3. **Given** a nested task, **When** the user moves it to root level, **Then** the task becomes a top-level task with no parent
4. **Given** a parent task with children, **When** the user moves the parent, **Then** all children move with the parent maintaining their relative structure

---

### Edge Cases

- What happens when a parent task is deleted? **All descendant tasks are also deleted (cascade delete) with confirmation dialog.**
- What happens when a parent task is marked complete? **Parent can only be marked complete manually; completing a parent does not automatically complete children.**
- What is the maximum nesting depth? **No artificial limit imposed; limited only by practical usability (recommended visual clarity up to 5-7 levels).**
- What happens when a task is moved to become its own descendant? **Operation is prevented (circular reference protection).**
- What happens when a parent is moved to the inbox from a context? **All children inherit the context change (move to inbox).**
- What happens during data export/import with nested tasks? **Parent-child relationships are preserved; orphaned children (missing parent) become root-level tasks.**
- What happens when two devices simultaneously change a task's parent? **Last-write-wins; the most recent change takes precedence, consistent with existing sync behavior.**

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any task to have zero or more child tasks
- **FR-002**: System MUST allow tasks to be nested to unlimited depth
- **FR-003**: System MUST display parent tasks with an expand/collapse control when they have children
- **FR-004**: System MUST display all child tasks (including completed ones) in an accordion-style expansion under their parent when expanded
- **FR-005**: System MUST track and persist expansion state for each parent task (expanded/collapsed) across sessions
- **FR-006**: System MUST provide a "focus" action triggered by clicking the task title (distinct from checkbox and expand/collapse controls) that sets it as the current view root
- **FR-007**: System MUST display a breadcrumb trail when focused on a non-root task
- **FR-008**: System MUST allow navigation to any ancestor via breadcrumb clicks
- **FR-009**: System MUST support focus navigation in both definition mode and working mode
- **FR-010**: System MUST display subtask progress on parent tasks showing direct children only (e.g., "2/5 complete" counts immediate children, not grandchildren)
- **FR-011**: System MUST prevent circular parent-child relationships (task cannot be its own ancestor)
- **FR-012**: System MUST cascade delete all descendant tasks when a parent is deleted (with confirmation)
- **FR-013**: System MUST move children along with parent when parent changes context
- **FR-014**: System MUST allow drag-and-drop reordering of sibling tasks
- **FR-015**: System MUST allow moving tasks between parents via drag-and-drop
- **FR-016**: System MUST preserve parent-child relationships in data export/import
- **FR-017**: System MUST handle orphaned tasks (missing parent after import) by making them root-level tasks

### Key Entities

- **Task** (extended): Existing task entity gains a `parentId` attribute (nullable, references another Task). When null, task is a root-level task. When set, task is a child of the referenced task.
- **Focus State**: Runtime state tracking which task (if any) is currently the "focused" root for display. Null means showing all root-level tasks.
- **Expansion State**: Runtime state (or persisted preference) tracking which parent tasks are expanded vs. collapsed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a 5-level deep task hierarchy within 60 seconds
- **SC-002**: Users can navigate from deepest nested task to root in under 3 clicks using breadcrumbs
- **SC-003**: Expanding/collapsing a parent with 20 child tasks completes instantly (no perceptible delay)
- **SC-004**: 90% of users can successfully create a subtask on their first attempt without instructions
- **SC-005**: Task hierarchy is preserved exactly after export and re-import (zero data loss)
- **SC-006**: Focus mode shows only the focused task and its descendants with no sibling tasks visible
- **SC-007**: Parent task progress indicator accurately reflects the completion state of all direct children

## Clarifications

### Session 2026-01-25

- Q: Should progress indicator count direct children only or all descendants recursively? → A: Direct children only
- Q: How should users trigger focus mode on a task? → A: Click on task title (distinct from checkbox/expand areas)
- Q: How should cross-device sync conflicts for parent changes be resolved? → A: Last-write-wins (most recent change takes precedence)
- Q: Should expansion state persist across page reloads/browser restarts? → A: Yes, persist across sessions
- Q: Should completed subtasks be visible when parent is expanded? → A: Yes, show completed subtasks (full visibility)

## Assumptions

- **Task ordering**: Child tasks follow the same fractional position ordering system as existing root-level tasks
- **Context inheritance**: Child tasks inherit their context from their parent; children cannot belong to a different context than their parent
- **Completion behavior**: Completing a parent task does not automatically complete children (and vice versa); progress is shown but completion is independent
- **Default expansion state**: Parent tasks are collapsed by default; expansion state persists across sessions (stored in localStorage)
- **Focus persistence**: Focus state resets when changing contexts or switching between definition/working mode
- **Touch support**: Mobile users can tap to focus and use swipe gestures consistent with existing drag-and-drop patterns
