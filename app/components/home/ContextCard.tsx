'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Context, Task } from '@/lib/types';
import { getContextColor } from '@/lib/colors';
import { formatCountdownWithUrgency, getDaysRemaining } from '@/lib/dates';
import { getUrgencyColorClass, cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface ContextCardProps {
  context: Context;
  tasks: Task[];
  onClick: () => void;
}

export function ContextCard({ context, tasks, onClick }: ContextCardProps) {
  const colorClasses = getContextColor(context.color);

  // Calculate task stats
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const hasIncompleteTasks = completedCount < totalCount;

  // Find the nearest deadline from tasks or important dates
  const nearestDeadline = useMemo(() => {
    const deadlines: { date: string; label?: string }[] = [];

    // Add task deadlines
    tasks.forEach(task => {
      if (task.deadline && !task.completed) {
        deadlines.push({ date: task.deadline });
      }
    });

    // Add important dates
    context.importantDates?.forEach(importantDate => {
      deadlines.push({ date: importantDate.date, label: importantDate.label });
    });

    if (deadlines.length === 0) return null;

    // Sort by days remaining and get the nearest
    const sorted = deadlines.sort((a, b) =>
      getDaysRemaining(a.date) - getDaysRemaining(b.date)
    );

    return sorted[0];
  }, [tasks, context.importantDates]);

  // Format deadline display
  const deadlineDisplay = nearestDeadline
    ? formatCountdownWithUrgency(nearestDeadline.date)
    : null;

  const urgencyColors = deadlineDisplay
    ? getUrgencyColorClass(deadlineDisplay.urgency)
    : null;

  // Priority label
  const priorityLabel = `P${context.priority}`;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "group",
        "h-[100px]" // Fixed height for uniform sizing
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`${context.name} context, ${totalCount} tasks, priority ${context.priority}${deadlineDisplay ? `, ${deadlineDisplay.text}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="p-3 h-full flex flex-col">
        {/* Header row: color dot, title, priority */}
        <div className="flex items-center gap-2">
          <div
            className={cn("size-2.5 rounded-full shrink-0", colorClasses.dot)}
            aria-hidden="true"
          />
          <span className="text-sm font-medium truncate flex-1">
            {context.name}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] shrink-0 py-0 px-1.5 h-4"
          >
            {priorityLabel}
          </Badge>
        </div>

        {/* Footer row: task count and deadline on same line */}
        <div className="mt-auto flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground shrink-0">
            {hasIncompleteTasks ? (
              <>{completedCount}/{totalCount} tasks</>
            ) : totalCount > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-500">All done</span>
            ) : (
              <>No tasks</>
            )}
          </span>

          {deadlineDisplay && urgencyColors && (
            <div className={cn(
              "flex items-center gap-1 truncate",
              urgencyColors.text
            )}>
              <Calendar className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{deadlineDisplay.text}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
