'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDeadlineUrgency, formatCountdownWithUrgency } from '@/lib/dates';
import type { Task, DeadlineUrgency } from '@/lib/types';

interface UrgentTasksBannerProps {
  tasks: Task[];
  className?: string;
}

interface UrgentTask {
  task: Task;
  urgency: DeadlineUrgency;
  text: string;
}

export function UrgentTasksBanner({ tasks, className }: UrgentTasksBannerProps) {
  // Filter and sort urgent tasks (overdue or due today)
  const urgentTasks = useMemo(() => {
    const urgent: UrgentTask[] = [];

    for (const task of tasks) {
      if (task.completed || !task.deadline) continue;

      const urgency = getDeadlineUrgency(task.deadline);
      if (urgency === 'overdue' || urgency === 'urgent') {
        const { text } = formatCountdownWithUrgency(task.deadline);
        urgent.push({ task, urgency, text });
      }
    }

    // Sort: overdue first, then urgent (today)
    return urgent.sort((a, b) => {
      if (a.urgency === 'overdue' && b.urgency !== 'overdue') return -1;
      if (a.urgency !== 'overdue' && b.urgency === 'overdue') return 1;
      return 0;
    });
  }, [tasks]);

  if (urgentTasks.length === 0) {
    return null;
  }

  // Show up to 3 tasks
  const displayTasks = urgentTasks.slice(0, 3);
  const hasMore = urgentTasks.length > 3;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg mb-4',
        'bg-destructive/10 border border-destructive/20',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        className="h-5 w-5 text-destructive shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">
          {urgentTasks.length} task{urgentTasks.length !== 1 ? 's' : ''} need{urgentTasks.length === 1 ? 's' : ''} attention
        </p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {displayTasks.map(({ task, urgency, text }) => (
            <span
              key={task.id}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs',
                'px-2 py-1 rounded-md',
                urgency === 'overdue'
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
              )}
            >
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {task.title}
              </span>
              <span className="text-[10px] opacity-75 uppercase font-medium shrink-0">
                {text}
              </span>
            </span>
          ))}
          {hasMore && (
            <span className="text-xs text-muted-foreground self-center">
              +{urgentTasks.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
