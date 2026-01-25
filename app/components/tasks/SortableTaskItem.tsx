'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { TaskListItem, TaskListItemProps } from './TaskListItem';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps extends Omit<TaskListItemProps, 'dragHandleProps'> {
  task: Task;
  activeTaskId?: string | null;
}

export function SortableTaskItem({ task, activeTaskId, ...props }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
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

  // Show drop zone indicator when dragging and hovering over drop area
  const showDropZone = activeTaskId && activeTaskId !== task.id && !isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'z-50 opacity-50'
      )}
    >
      <TaskListItem
        task={task}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...props}
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
    </div>
  );
}
