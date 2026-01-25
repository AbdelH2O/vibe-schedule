'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { WorkingTaskItem } from './WorkingTaskItem';
import { cn } from '@/lib/utils';
import type { ContextColorName } from '@/lib/colors';

interface SortableWorkingTaskItemProps {
  task: Task;
  contextColor?: ContextColorName;
  onToggleCompleted: (taskId: string) => void;
  onUpdateDescription?: (description: string) => void;
  onDelete?: (taskId: string) => void;
  onAddSubtask?: (parentId: string) => void;
  // Hierarchy props
  depth?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  childStats?: { completed: number; total: number };
  onToggleExpand?: () => void;
  onFocus?: (taskId: string) => void;
  activeTaskId?: string | null;
}

export function SortableWorkingTaskItem({
  task,
  contextColor,
  onToggleCompleted,
  onUpdateDescription,
  onDelete,
  onAddSubtask,
  depth = 0,
  isExpanded = false,
  hasChildren = false,
  childStats,
  onToggleExpand,
  onFocus,
  activeTaskId,
}: SortableWorkingTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: task.completed,
  });

  // Create a droppable zone for making this task a parent
  const {
    setNodeRef: setDroppableRef,
    isOver: isOverDropZone,
  } = useDroppable({
    id: `drop-child-${task.id}`,
    data: {
      type: 'make-child',
      targetTaskId: task.id,
    },
    // Disable dropping on self or when not dragging
    disabled: !activeTaskId || activeTaskId === task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Show drop zone indicator when dragging and not dragging this item
  const showDropZone = activeTaskId && activeTaskId !== task.id && !isDragging;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'z-50 opacity-50')}
    >
      <WorkingTaskItem
        task={task}
        contextColor={contextColor}
        onToggleCompleted={onToggleCompleted}
        onUpdateDescription={onUpdateDescription}
        onDelete={onDelete}
        onAddSubtask={onAddSubtask}
        dragHandleProps={!task.completed ? { ...attributes, ...listeners } : undefined}
        depth={depth}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        childStats={childStats}
        onToggleExpand={onToggleExpand}
        onFocus={onFocus}
      />
      {/* Drop zone indicator for making child */}
      {showDropZone && (
        <div
          ref={setDroppableRef}
          className={cn(
            'ml-8 h-6 -mt-1 mb-1 rounded-md border-2 border-dashed transition-colors flex items-center justify-center text-xs',
            isOverDropZone
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-muted-foreground/30 text-muted-foreground/50'
          )}
        >
          {isOverDropZone ? 'Make subtask' : ''}
        </div>
      )}
    </li>
  );
}
