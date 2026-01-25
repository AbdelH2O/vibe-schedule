'use client';

import { cn } from '@/lib/utils';

export interface TaskProgressBadgeProps {
  completed: number;
  total: number;
  className?: string;
}

/**
 * Displays child task completion progress as "X/Y" badge.
 * Shows completion ratio of direct children for a parent task.
 */
export function TaskProgressBadge({
  completed,
  total,
  className,
}: TaskProgressBadgeProps) {
  if (total === 0) return null;

  const isComplete = completed === total;

  return (
    <span
      className={cn(
        'text-xs px-1.5 py-0.5 rounded-sm font-medium tabular-nums',
        isComplete
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
      title={`${completed} of ${total} subtasks completed`}
    >
      {completed}/{total}
    </span>
  );
}
