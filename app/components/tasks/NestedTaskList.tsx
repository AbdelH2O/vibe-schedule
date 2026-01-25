'use client';

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import { getChildren, getChildCompletionStats, hasChildren as checkHasChildren } from '@/lib/taskHierarchy';
import { TaskListItem } from './TaskListItem';

export interface NestedTaskListProps {
  tasks: Task[];
  parentId: string | null;
  depth?: number;
  expandedTaskIds: string[];
  onToggleExpand: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onUpdateDescription?: (taskId: string, description: string) => void;
  onAddSubtask?: (parentId: string) => void;
}

/**
 * Recursively renders a nested task list with expand/collapse functionality.
 * Filters tasks by parentId and renders children when expanded.
 */
export function NestedTaskList({
  tasks,
  parentId,
  depth = 0,
  expandedTaskIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onUpdateDescription,
  onAddSubtask,
}: NestedTaskListProps) {
  // Get direct children of the current parent
  const children = useMemo(
    () => getChildren(tasks, parentId),
    [tasks, parentId]
  );

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-0.5">
      {children.map((task) => {
        const hasChildTasks = checkHasChildren(tasks, task.id);
        const isExpanded = expandedTaskIds.includes(task.id);
        const childStats = hasChildTasks
          ? getChildCompletionStats(tasks, task.id)
          : undefined;

        return (
          <div key={task.id}>
            <TaskListItem
              task={task}
              depth={depth}
              isExpanded={isExpanded}
              hasChildren={hasChildTasks}
              childStats={childStats}
              onToggleExpand={() => onToggleExpand(task.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdateDescription={onUpdateDescription}
              onAddSubtask={onAddSubtask}
            />
            {/* Recursively render children when expanded */}
            {hasChildTasks && isExpanded && (
              <NestedTaskList
                tasks={tasks}
                parentId={task.id}
                depth={depth + 1}
                expandedTaskIds={expandedTaskIds}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateDescription={onUpdateDescription}
                onAddSubtask={onAddSubtask}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
