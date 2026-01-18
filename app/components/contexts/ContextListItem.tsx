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
import { getDaysRemaining, getCountdownStatus } from '@/lib/dates';
import { AlertCircle } from 'lucide-react';
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
  // Check for upcoming deadlines (within 7 days or overdue)
  const hasUpcomingDeadline = context.importantDates?.some((date) => {
    const days = getDaysRemaining(date.date);
    return days <= 7;
  });

  // Find the most urgent deadline status
  const urgentStatus = context.importantDates?.reduce<'overdue' | 'soon' | 'upcoming' | null>(
    (worst, date) => {
      const status = getCountdownStatus(getDaysRemaining(date.date));
      if (status === 'overdue') return 'overdue';
      if (status === 'soon' && worst !== 'overdue') return 'soon';
      return worst;
    },
    null
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-left h-auto py-2 px-3',
              isSelected && 'bg-accent text-accent-foreground'
            )}
            onClick={onClick}
          >
            <div className="flex items-center gap-2 w-full min-w-0">
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

              {/* Deadline indicator */}
              {hasUpcomingDeadline && (
                <AlertCircle
                  className={cn(
                    'size-4 shrink-0',
                    urgentStatus === 'overdue' && 'text-destructive',
                    urgentStatus === 'soon' && 'text-amber-500'
                  )}
                  aria-label="Has upcoming deadline"
                />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="font-medium">{context.name}</p>
          <p className="text-xs text-muted-foreground">
            Priority: {context.priority} | Weight: {context.weight}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
