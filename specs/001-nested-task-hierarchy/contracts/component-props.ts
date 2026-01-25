/**
 * Component Props Contracts for Nested Task Hierarchy
 *
 * Documents the prop interfaces for new and modified components.
 * Not executable code - serves as implementation contract.
 */

import type { Task } from '@/lib/types';

// ============================================
// NEW COMPONENTS
// ============================================

/**
 * NestedTaskList - Recursively renders tasks with hierarchy
 */
export interface NestedTaskListProps {
  /** Tasks to display (pre-filtered by parentId) */
  tasks: Task[];

  /** Current parent ID context (null = root level) */
  parentId: string | null;

  /** Current nesting depth (for indentation) */
  depth: number;

  /** Set of expanded task IDs */
  expandedTaskIds: Set<string>;

  /** Currently focused task ID (for breadcrumb context) */
  focusedTaskId: string | null;

  /** Callback when task is clicked for focus */
  onFocusTask: (taskId: string | null) => void;

  /** Callback when expand/collapse is toggled */
  onToggleExpand: (taskId: string) => void;

  /** Callback when task is edited */
  onEditTask?: (task: Task) => void;

  /** Callback when task is deleted */
  onDeleteTask?: (taskId: string) => void;

  /** Whether drag-and-drop is enabled */
  enableDragDrop?: boolean;

  /** Callback when task is moved to new parent */
  onMoveToParent?: (taskId: string, newParentId: string | null) => void;
}

/**
 * TaskBreadcrumb - Shows navigation path to focused task
 */
export interface TaskBreadcrumbProps {
  /** Ancestor chain from root to current focus (ordered) */
  ancestors: Array<{
    id: string | null;  // null = root
    label: string;
  }>;

  /** Callback when breadcrumb item is clicked */
  onNavigate: (taskId: string | null) => void;

  /** Optional class name for styling */
  className?: string;
}

/**
 * TaskProgressBadge - Shows child completion status
 */
export interface TaskProgressBadgeProps {
  /** Number of completed direct children */
  completed: number;

  /** Total number of direct children */
  total: number;

  /** Optional class name for styling */
  className?: string;
}

/**
 * ExpandCollapseButton - Toggle for task expansion
 */
export interface ExpandCollapseButtonProps {
  /** Whether the task is currently expanded */
  isExpanded: boolean;

  /** Whether the task has children (hides button if false) */
  hasChildren: boolean;

  /** Callback when clicked */
  onToggle: () => void;

  /** Optional class name for styling */
  className?: string;
}

// ============================================
// MODIFIED COMPONENTS
// ============================================

/**
 * TaskListItem - Extended props
 */
export interface TaskListItemPropsExtended {
  task: Task;

  // Existing props
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onUpdateDescription?: (taskId: string, description: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;

  // NEW props for hierarchy
  /** Current nesting depth (for indentation styling) */
  depth?: number;

  /** Whether this task is expanded (showing children) */
  isExpanded?: boolean;

  /** Whether this task has children */
  hasChildren?: boolean;

  /** Child completion stats */
  childStats?: { completed: number; total: number };

  /** Callback when expand/collapse is toggled */
  onToggleExpand?: () => void;

  /** Callback when task title is clicked (focus trigger) */
  onFocus?: () => void;
}

/**
 * SortableTaskList - Extended props
 */
export interface SortableTaskListPropsExtended {
  tasks: Task[];
  onReorder: (taskId: string, newPosition: string) => void;

  // NEW props for hierarchy
  /** Filter tasks by parent ID */
  parentId?: string | null;

  /** Current nesting depth */
  depth?: number;

  /** Set of expanded task IDs */
  expandedTaskIds?: Set<string>;

  /** Callback for expand toggle */
  onToggleExpand?: (taskId: string) => void;

  /** Callback for focus action */
  onFocusTask?: (taskId: string | null) => void;

  /** Callback for moving task to different parent */
  onMoveToParent?: (taskId: string, newParentId: string | null) => void;
}

/**
 * ContextDetail - Extended with focus state
 */
export interface ContextDetailPropsExtended {
  contextId: string;

  // NEW: Focus state management (internal, not passed as props)
  // - focusedTaskId: string | null
  // - onFocusTask: (taskId: string | null) => void
  // - breadcrumbAncestors: computed from focusedTaskId
}

/**
 * InboxView - Extended with focus state
 */
export interface InboxViewPropsExtended {
  // No external props, but internal state management:
  // - focusedTaskId: string | null
  // - onFocusTask: (taskId: string | null) => void
  // - breadcrumbAncestors: computed from focusedTaskId
}

/**
 * WorkingTaskItem - Extended props
 */
export interface WorkingTaskItemPropsExtended {
  task: Task;
  isActive?: boolean;

  // NEW props
  /** Current nesting depth */
  depth?: number;

  /** Whether this task is expanded */
  isExpanded?: boolean;

  /** Whether this task has children */
  hasChildren?: boolean;

  /** Child completion stats */
  childStats?: { completed: number; total: number };

  /** Callback when expand/collapse is toggled */
  onToggleExpand?: () => void;

  /** Callback when task is focused */
  onFocus?: () => void;
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Drag-and-drop events for hierarchy
 */
export interface HierarchyDragEvents {
  /** Task being dragged */
  activeTask: Task;

  /** Current drop target */
  overTarget: {
    type: 'task' | 'list' | 'root';
    id: string | null;
  } | null;

  /** Visual drop indicator position */
  dropIndicator: {
    parentId: string | null;
    position: 'before' | 'after' | 'inside';
    targetId: string;
  } | null;
}
