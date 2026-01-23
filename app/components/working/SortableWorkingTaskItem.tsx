'use client';

import { useSortable } from '@dnd-kit/sortable';
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
}

export function SortableWorkingTaskItem({
  task,
  contextColor,
  onToggleCompleted,
  onUpdateDescription,
  onDelete,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        dragHandleProps={!task.completed ? { ...attributes, ...listeners } : undefined}
      />
    </li>
  );
}
