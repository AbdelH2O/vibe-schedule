'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountdownBadge } from '@/app/components/shared/CountdownBadge';
import { getDeadlineUrgency, getDaysRemaining } from '@/lib/dates';
import type { ImportantDate, DeadlineUrgency } from '@/lib/types';

interface ContextDatesSectionProps {
  importantDates: ImportantDate[];
}

function getUrgencyPriority(urgency: DeadlineUrgency): number {
  switch (urgency) {
    case 'overdue': return 0;
    case 'urgent': return 1;
    case 'warning': return 2;
    case 'neutral': return 3;
    default: return 4;
  }
}

export function ContextDatesSection({ importantDates }: ContextDatesSectionProps) {
  // Sort dates by urgency (most pressing first)
  const sortedDates = useMemo(() => {
    return [...importantDates].sort((a, b) => {
      const urgencyA = getUrgencyPriority(getDeadlineUrgency(a.date));
      const urgencyB = getUrgencyPriority(getDeadlineUrgency(b.date));
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      // Secondary sort by days remaining
      return getDaysRemaining(a.date) - getDaysRemaining(b.date);
    });
  }, [importantDates]);

  // Check if any dates are urgent or overdue
  const hasUrgentDates = useMemo(() => {
    return importantDates.some((d) => {
      const urgency = getDeadlineUrgency(d.date);
      return urgency === 'overdue' || urgency === 'urgent';
    });
  }, [importantDates]);

  // Count warning/urgent dates for indicator
  const urgentCount = useMemo(() => {
    return importantDates.filter((d) => {
      const urgency = getDeadlineUrgency(d.date);
      return urgency === 'overdue' || urgency === 'urgent' || urgency === 'warning';
    }).length;
  }, [importantDates]);

  // Auto-expand when urgent
  const [isExpanded, setIsExpanded] = useState(hasUrgentDates);

  if (importantDates.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={isExpanded}
        aria-controls="context-dates-list"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>
            {importantDates.length} important date{importantDates.length !== 1 ? 's' : ''}
            {urgentCount > 0 && (
              <span className="ml-1 text-destructive">
                ({urgentCount} urgent)
              </span>
            )}
          </span>
          {/* Urgent indicator dot */}
          {hasUrgentDates && (
            <span
              className="size-2 rounded-full bg-destructive animate-pulse-slow"
              aria-label="Has urgent deadlines"
            />
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <ul
          id="context-dates-list"
          className="mt-3 space-y-2"
          role="list"
        >
          {sortedDates.map((date) => (
            <li
              key={date.id}
              className="flex items-center justify-between gap-2 text-sm pl-6"
            >
              <span className="truncate text-foreground">{date.label}</span>
              <CountdownBadge
                date={date.date}
                showIcon={true}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
