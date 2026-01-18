'use client';

import { useStore } from '@/lib/store';
import { WorkingTaskItem } from './WorkingTaskItem';
import { CheckCircle2 } from 'lucide-react';

interface WorkingTaskListProps {
  contextId: string;
}

export function WorkingTaskList({ contextId }: WorkingTaskListProps) {
  const { getTasksByContextId, toggleTaskCompleted } = useStore();

  const tasks = getTasksByContextId(contextId);

  if (tasks.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-card">
        <h3 className="font-medium mb-4">Tasks</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="size-10 text-muted-foreground/50 mb-3" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">
            No tasks in this context
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Add tasks in Definition Mode
          </p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Tasks</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} completed
        </span>
      </div>
      <ul className="space-y-2" role="list">
        {tasks.map((task) => (
          <li key={task.id}>
            <WorkingTaskItem
              task={task}
              onToggleCompleted={toggleTaskCompleted}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
