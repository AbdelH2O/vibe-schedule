'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { formatDuration, type AllocationWarning } from '@/lib/allocation';
import { cn } from '@/lib/utils';

interface OverCommitWarningProps {
  warning: AllocationWarning;
  onExtendTime: (suggestedMinutes: number) => void;
  onProceedAnyway: () => void;
  className?: string;
}

export function OverCommitWarning({
  warning,
  onExtendTime,
  onProceedAnyway,
  className,
}: OverCommitWarningProps) {
  const excessMinutes = warning.details?.excessMinutes ?? 0;
  const suggestedMinutes = warning.details?.suggestedMinutes ?? 0;

  return (
    <div
      className={cn(
        'rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4',
        className
      )}
      role="alert"
      aria-labelledby="overcommit-title"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="size-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex-1 space-y-3">
          <div>
            <h4
              id="overcommit-title"
              className="font-medium text-yellow-600 dark:text-yellow-500"
            >
              Time Over-Committed
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {warning.message}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExtendTime(suggestedMinutes)}
              className="border-yellow-500/30 hover:bg-yellow-500/10"
            >
              Extend to {formatDuration(suggestedMinutes)}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onProceedAnyway}
              className="text-muted-foreground hover:text-foreground"
            >
              Proceed with proportional reduction
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Proceeding will distribute time proportionally based on minimum durations,
            reducing each context&apos;s time by {excessMinutes > 0 ? Math.round((excessMinutes / (suggestedMinutes || 1)) * 100) : 0}%.
          </p>
        </div>
      </div>
    </div>
  );
}
