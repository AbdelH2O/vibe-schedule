'use client';

import { type ReactNode } from 'react';
import { Task } from '@/lib/types';
import { TaskListItem } from './TaskListItem';
import { EmptyState } from '../shared/EmptyState';
import { CheckSquare } from 'lucide-react';

export interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskList({
  tasks,
  emptyMessage = 'No tasks yet',
  emptyDescription,
  emptyAction,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare />}
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
        size="sm"
      />
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  );
}
