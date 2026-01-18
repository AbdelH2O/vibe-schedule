'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getDaysRemaining } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { CountdownBadge } from '@/app/components/shared/CountdownBadge';
import { getContextColor } from '@/lib/colors';
import type { Context } from '@/lib/types';

interface ContextListItemProps {
  context: Context;
  isSelected?: boolean;
  onClick?: () => void;
}

// Priority labels for display
const priorityLabels: Record<number, string> = {
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
  5: 'P5',
};

// Priority colors
const priorityColors: Record<number, string> = {
  1: 'bg-red-500/15 text-red-700 dark:text-red-400',
  2: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  3: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  4: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  5: 'bg-gray-500/15 text-gray-700 dark:text-gray-400',
};

export function ContextListItem({
  context,
  isSelected,
  onClick,
}: ContextListItemProps) {
  const { getTasksByContextId } = useStore();
  const taskCount = getTasksByContextId(context.id).length;

  // Find the nearest important date (most urgent)
  const nearestDate = context.importantDates?.reduce<{ date: string; days: number } | null>(
    (nearest, importantDate) => {
      const days = getDaysRemaining(importantDate.date);
      if (nearest === null || days < nearest.days) {
        return { date: importantDate.date, days };
      }
      return nearest;
    },
    null
  );

  // Show countdown badge for dates within 14 days or overdue
  const showCountdownBadge = nearestDate && nearestDate.days <= 14;

  // Get context color classes
  const colorClasses = getContextColor(context.color ?? 'blue');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-left h-auto py-2 px-3 rounded-md',
              isSelected && 'ring-2 ring-inset ring-primary/50'
            )}
            onClick={onClick}
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              {/* Color indicator dot */}
              <div
                className={cn("size-2 rounded-full shrink-0", colorClasses.dot)}
                aria-hidden="true"
              />

              {/* Priority badge */}
              <Badge
                variant="secondary"
                className={cn(
                  'shrink-0 text-xs px-1.5 py-0',
                  priorityColors[context.priority] || priorityColors[3]
                )}
                aria-label={`Priority ${context.priority}`}
              >
                {priorityLabels[context.priority] || 'P3'}
              </Badge>

              {/* Context name with truncation */}
              <span className="truncate flex-1">{context.name}</span>

              {/* Task count badge */}
              {taskCount > 0 && (
                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs px-1.5 py-0 bg-muted"
                  aria-label={`${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}`}
                >
                  {taskCount}
                </Badge>
              )}

              {/* Deadline countdown badge */}
              {showCountdownBadge && nearestDate && (
                <CountdownBadge
                  date={nearestDate.date}
                  className="shrink-0"
                  showIcon={false}
                />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="font-medium">{context.name}</p>
          <p className="text-xs text-muted-foreground">
            Priority: {context.priority} | Weight: {context.weight} | {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
