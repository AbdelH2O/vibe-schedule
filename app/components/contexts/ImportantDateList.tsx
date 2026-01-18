'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CountdownBadge } from '@/app/components/shared/CountdownBadge';
import { Calendar, X } from 'lucide-react';
import type { ImportantDate } from '@/lib/types';

interface ImportantDateListProps {
  dates: ImportantDate[];
  onRemove?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function ImportantDateList({
  dates,
  onRemove,
  className,
  compact = false,
}: ImportantDateListProps) {
  if (dates.length === 0) {
    return (
      <p className={cn('text-muted-foreground italic', compact ? 'text-xs' : 'text-sm')}>
        No important dates set
      </p>
    );
  }

  return (
    <ul className={cn(compact ? 'space-y-1' : 'space-y-2', className)} aria-label="Important dates">
      {dates.map((date) => {
        return (
          <li
            key={date.id}
            className={cn(
              'flex items-center justify-between gap-2',
              compact
                ? 'py-1.5 px-2 rounded-sm bg-muted/30'
                : 'p-2 rounded-md border bg-muted/50'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar
                className={cn(
                  'text-muted-foreground shrink-0',
                  compact ? 'size-3' : 'size-4'
                )}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className={cn('font-medium truncate', compact ? 'text-xs' : 'text-sm')}>
                  {date.label}
                </p>
                {!compact && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(date.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CountdownBadge date={date.date} showIcon={!compact} />
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={compact ? 'size-5' : 'size-6'}
                  onClick={() => onRemove(date.id)}
                  aria-label={`Remove ${date.label}`}
                >
                  <X className={compact ? 'size-2.5' : 'size-3'} aria-hidden="true" />
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
