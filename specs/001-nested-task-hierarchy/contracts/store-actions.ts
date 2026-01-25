/**
 * Store Action Contracts for Nested Task Hierarchy
 *
 * This file documents the new and modified store actions required
 * for the nested task hierarchy feature. Not executable code -
 * serves as implementation contract.
 */

// ============================================
// NEW ACTIONS
// ============================================

/**
 * Add a subtask under an existing task
 */
type ADD_SUBTASK = {
  type: 'ADD_SUBTASK';
  payload: {
    parentId: string;  // Required: parent task ID
    title: string;
    description?: string;
    deadline?: string;
  };
};
// Behavior:
// - Creates new task with parentId set
// - Inherits contextId from parent
// - Position generated as last among siblings
// - Returns new task ID

/**
 * Move a task to a different parent (or to root)
 */
type MOVE_TASK_TO_PARENT = {
  type: 'MOVE_TASK_TO_PARENT';
  payload: {
    taskId: string;
    newParentId: string | null;  // null = move to root
    position?: string;           // Optional: specific position among new siblings
  };
};
// Behavior:
// - Validates no circular reference (newParentId cannot be descendant of taskId)
// - Updates task's parentId
// - If new parent has different contextId, cascade update to all descendants
// - If position not provided, places at end of new siblings

/**
 * Toggle task expansion state
 */
type TOGGLE_TASK_EXPANDED = {
  type: 'TOGGLE_TASK_EXPANDED';
  payload: string;  // Task ID
};
// Behavior:
// - If ID in expandedTaskIds, remove it (collapse)
// - If ID not in expandedTaskIds, add it (expand)
// - Persisted to localStorage

/**
 * Set multiple tasks expanded (bulk operation)
 */
type SET_TASKS_EXPANDED = {
  type: 'SET_TASKS_EXPANDED';
  payload: {
    taskIds: string[];
    expanded: boolean;
  };
};
// Behavior:
// - If expanded=true, add all IDs to expandedTaskIds
// - If expanded=false, remove all IDs from expandedTaskIds
// - Useful for "expand all" / "collapse all" operations

// ============================================
// MODIFIED ACTIONS
// ============================================

/**
 * ADD_TASK - Modified to support optional parentId
 */
type ADD_TASK_MODIFIED = {
  type: 'ADD_TASK';
  payload: {
    title: string;
    contextId: string | null;
    description?: string;
    deadline?: string;
    parentId?: string;  // NEW: optional parent
  };
};
// Behavior change:
// - If parentId provided, task is created as child
// - If parentId provided and contextId differs from parent, use parent's contextId

/**
 * DELETE_TASK - Modified for cascade delete
 */
type DELETE_TASK_MODIFIED = {
  type: 'DELETE_TASK';
  payload: string;  // Task ID (unchanged)
};
// Behavior change:
// - Recursively deletes all descendant tasks
// - Removes deleted task IDs from expandedTaskIds
// - UI must show confirmation with descendant count

/**
 * MOVE_TASK_TO_CONTEXT - Modified to cascade to children
 */
type MOVE_TASK_TO_CONTEXT_MODIFIED = {
  type: 'MOVE_TASK_TO_CONTEXT';
  payload: {
    taskId: string;
    contextId: string | null;
  };
};
// Behavior change:
// - Also updates contextId for all descendant tasks
// - Preserves parent-child relationships

/**
 * REORDER_TASK - No changes needed
 * Already handles position updates for sibling reordering
 */

// ============================================
// SYNC ACTIONS (for cross-device)
// ============================================

// Existing SYNC_* actions already handle full Task objects
// parentId will be included automatically
// No new sync actions needed

// ============================================
// SELECTORS (New)
// ============================================

/**
 * Get tasks filtered by parent ID
 * @param parentId - null for root tasks, string for children of that parent
 */
// getTasksByParent(state: AppState, parentId: string | null): Task[]

/**
 * Get all descendants of a task (recursive)
 */
// getTaskDescendants(state: AppState, taskId: string): Task[]

/**
 * Get ancestor chain for breadcrumb (from root to task)
 */
// getTaskAncestors(state: AppState, taskId: string): Task[]

/**
 * Get child completion stats for a task
 */
// getChildCompletionStats(state: AppState, taskId: string): { completed: number; total: number }

/**
 * Check if a task has any children
 */
// hasChildren(state: AppState, taskId: string): boolean

/**
 * Check if taskId is a descendant of ancestorId (for circular reference prevention)
 */
// isDescendantOf(state: AppState, taskId: string, ancestorId: string): boolean
