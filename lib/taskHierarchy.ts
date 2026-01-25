/**
 * Task hierarchy helper functions for nested task operations.
 * All functions work with a flat array of tasks and derive tree structure on-demand.
 */

import type { Task } from './types';

/**
 * Get direct children of a task (or root-level tasks if parentId is null).
 * @param tasks - All tasks
 * @param parentId - Parent task ID, or null for root-level tasks
 * @returns Array of direct child tasks
 */
export function getChildren(tasks: Task[], parentId: string | null): Task[] {
  return tasks.filter((task) => task.parentId === parentId);
}

/**
 * Get all descendants of a task (recursive).
 * @param tasks - All tasks
 * @param taskId - Parent task ID
 * @returns Array of all descendant tasks (children, grandchildren, etc.)
 */
export function getDescendants(tasks: Task[], taskId: string): Task[] {
  const children = tasks.filter((task) => task.parentId === taskId);
  return children.flatMap((child) => [child, ...getDescendants(tasks, child.id)]);
}

/**
 * Get ancestor chain for a task (from root to parent, excluding the task itself).
 * @param tasks - All tasks
 * @param taskId - Task ID to get ancestors for
 * @returns Array of ancestor tasks from root to immediate parent
 */
export function getAncestors(tasks: Task[], taskId: string): Task[] {
  const task = tasks.find((t) => t.id === taskId);
  if (!task?.parentId) return [];

  const parent = tasks.find((t) => t.id === task.parentId);
  if (!parent) return [];

  return [...getAncestors(tasks, parent.id), parent];
}

/**
 * Check if a task is a descendant of another task.
 * Used to prevent circular references when moving tasks.
 * @param tasks - All tasks
 * @param taskId - Task to check
 * @param ancestorId - Potential ancestor task ID
 * @returns true if taskId is a descendant of ancestorId
 */
export function isDescendantOf(
  tasks: Task[],
  taskId: string,
  ancestorId: string
): boolean {
  const descendants = getDescendants(tasks, ancestorId);
  return descendants.some((d) => d.id === taskId);
}

/**
 * Get child completion statistics for a task.
 * Counts only direct children (not grandchildren).
 * @param tasks - All tasks
 * @param taskId - Parent task ID
 * @returns Object with completed and total counts
 */
export function getChildCompletionStats(
  tasks: Task[],
  taskId: string
): { completed: number; total: number } {
  const children = getChildren(tasks, taskId);
  const completed = children.filter((child) => child.completed).length;
  return { completed, total: children.length };
}

/**
 * Check if a task has any children.
 * @param tasks - All tasks
 * @param taskId - Task ID to check
 * @returns true if task has at least one child
 */
export function hasChildren(tasks: Task[], taskId: string): boolean {
  return tasks.some((task) => task.parentId === taskId);
}

/**
 * Get the depth of a task in the hierarchy (0 = root level).
 * @param tasks - All tasks
 * @param taskId - Task ID
 * @returns Depth level (0 for root, 1 for first level children, etc.)
 */
export function getTaskDepth(tasks: Task[], taskId: string): number {
  return getAncestors(tasks, taskId).length;
}

/**
 * Build breadcrumb items for navigation.
 * @param tasks - All tasks
 * @param taskId - Currently focused task ID
 * @param rootLabel - Label for the root level (e.g., context name or "Inbox")
 * @returns Array of breadcrumb items from root to current task
 */
export function buildBreadcrumb(
  tasks: Task[],
  taskId: string | null,
  rootLabel: string
): Array<{ id: string | null; label: string }> {
  const items: Array<{ id: string | null; label: string }> = [
    { id: null, label: rootLabel },
  ];

  if (!taskId) return items;

  const ancestors = getAncestors(tasks, taskId);
  const currentTask = tasks.find((t) => t.id === taskId);

  for (const ancestor of ancestors) {
    items.push({ id: ancestor.id, label: ancestor.title });
  }

  if (currentTask) {
    items.push({ id: currentTask.id, label: currentTask.title });
  }

  return items;
}
