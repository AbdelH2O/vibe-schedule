'use client';

import { forwardRef } from 'react';
import { useStore } from '@/lib/store';
import type { ContextColorName } from '@/lib/colors';
import { WorkingTaskItem } from './WorkingTaskItem';
import { WorkingQuickAdd, type WorkingQuickAddRef } from './WorkingQuickAdd';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkingTaskListProps {
  contextId: string;
  contextColor?: ContextColorName;
}

export const WorkingTaskList = forwardRef<WorkingQuickAddRef, WorkingTaskListProps>(
  function WorkingTaskList({ contextId, contextColor }, ref) {
    const { getTasksByContextId, toggleTaskCompleted, updateTask } = useStore();

    const tasks = getTasksByContextId(contextId);
    const completedCount = tasks.filter((t) => t.completed).length;
    const totalCount = tasks.length;

    return (
      <div className={cn(
        'p-6 border rounded-lg',
        'bg-white'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Tasks</h3>
          {totalCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>

        {/* Quick add elevated to top */}
        <WorkingQuickAdd ref={ref} contextId={contextId} />

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="size-12 text-muted-foreground/50 mb-3" aria-hidden="true" />
            <p className="text-muted-foreground">
              No tasks in this context
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">n</kbd> to add a task
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {tasks.map((task) => (
              <li key={task.id}>
                <WorkingTaskItem
                  task={task}
                  contextColor={contextColor}
                  onToggleCompleted={toggleTaskCompleted}
                  onUpdateDescription={(description) =>
                    updateTask(task.id, { description })
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
