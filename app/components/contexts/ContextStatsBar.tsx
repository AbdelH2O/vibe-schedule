'use client';

import { CheckSquare, Clock, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getDaysRemaining } from '@/lib/dates';
import type { Task, ImportantDate } from '@/lib/types';

interface ContextStatsBarProps {
  tasks: Task[];
  minDuration?: number;
  maxDuration?: number;
  importantDates?: ImportantDate[];
}

export function ContextStatsBar({
  tasks,
  minDuration,
  maxDuration,
  importantDates = [],
}: ContextStatsBarProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  // Check for urgent dates (overdue or within 7 days)
  const urgentDates = importantDates.filter((d) => {
    const days = getDaysRemaining(d.date);
    return days < 0 || days <= 7;
  });
  const hasOverdue = importantDates.some((d) => getDaysRemaining(d.date) < 0);
  const hasUpcoming = urgentDates.length > 0 && !hasOverdue;

  // Format time range
  const getTimeRange = () => {
    if (minDuration && maxDuration) {
      return `${minDuration}-${maxDuration} min`;
    }
    if (minDuration) {
      return `${minDuration}+ min`;
    }
    if (maxDuration) {
      return `≤${maxDuration} min`;
    }
    return 'No limits';
  };

  return (
    <div
      className="flex items-center gap-4 text-sm text-muted-foreground"
      role="group"
      aria-label="Context statistics"
    >
      {/* Task count */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>{completedCount}/{totalCount} tasks</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {completedCount} of {totalCount} tasks completed
        </TooltipContent>
      </Tooltip>

      {/* Time range */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>{getTimeRange()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {minDuration && maxDuration
            ? `Duration: ${minDuration} to ${maxDuration} minutes`
            : minDuration
            ? `Minimum duration: ${minDuration} minutes`
            : maxDuration
            ? `Maximum duration: ${maxDuration} minutes`
            : 'No time constraints set'}
        </TooltipContent>
      </Tooltip>

      {/* Date count with urgency indicators */}
      {importantDates.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default">
              <Calendar className="size-3.5" aria-hidden="true" />
              <span>{importantDates.length} date{importantDates.length !== 1 ? 's' : ''}</span>
              {hasOverdue && (
                <span
                  className="size-2 rounded-full bg-destructive animate-pulse-slow"
                  aria-label="Overdue dates"
                />
              )}
              {hasUpcoming && !hasOverdue && (
                <span
                  className="size-2 rounded-full bg-amber-500"
                  aria-label="Upcoming dates within 7 days"
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {hasOverdue
              ? 'Has overdue dates'
              : hasUpcoming
              ? 'Has dates within 7 days'
              : `${importantDates.length} important date${importantDates.length !== 1 ? 's' : ''}`}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
