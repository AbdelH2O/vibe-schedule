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
}

export function ImportantDateList({
  dates,
  onRemove,
  className,
}: ImportantDateListProps) {
  if (dates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No important dates set
      </p>
    );
  }

  return (
    <ul className={cn('space-y-2', className)} aria-label="Important dates">
      {dates.map((date) => {
        return (
          <li
            key={date.id}
            className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{date.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(date.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CountdownBadge date={date.date} showIcon={true} />
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => onRemove(date.id)}
                  aria-label={`Remove ${date.label}`}
                >
                  <X className="size-3" aria-hidden="true" />
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
