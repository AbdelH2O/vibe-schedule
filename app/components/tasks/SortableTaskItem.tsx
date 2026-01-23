'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { TaskListItem, TaskListItemProps } from './TaskListItem';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps extends Omit<TaskListItemProps, 'dragHandleProps'> {
  task: Task;
}

export function SortableTaskItem({ task, ...props }: SortableTaskItemProps) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        dragHandleProps={!task.completed ? { ...attributes, ...listeners } : undefined}
        {...props}
      />
    </div>
  );
}
