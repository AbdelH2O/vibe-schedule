'use client';

import { useStore } from '@/lib/store';
import { formatDuration, type AllocationResult } from '@/lib/allocation';
import { cn } from '@/lib/utils';

interface AllocationPreviewProps {
  result: AllocationResult;
  sessionMinutes: number;
  className?: string;
}

export function AllocationPreview({
  result,
  sessionMinutes,
  className,
}: AllocationPreviewProps) {
  const { getContextById } = useStore();

  if (result.allocations.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {result.allocations.map((allocation) => {
          const context = getContextById(allocation.contextId);
          if (!context) return null;

          const percentage = sessionMinutes > 0
            ? Math.round((allocation.allocatedMinutes / sessionMinutes) * 100)
            : 0;

          // Check if this context is capped at maximum
          const isCapped = context.maxDuration !== undefined &&
            allocation.allocatedMinutes >= context.maxDuration;

          // Calculate weight percentage relative to total weights
          const totalWeight = result.allocations.reduce((sum, a) => {
            const ctx = getContextById(a.contextId);
            return sum + (ctx?.weight ?? 1);
          }, 0);
          const weightPercentage = totalWeight > 0
            ? Math.round((context.weight / totalWeight) * 100)
            : 0;

          return (
            <div
              key={allocation.contextId}
              className="space-y-1.5"
              role="listitem"
              aria-label={`${context.name}: ${formatDuration(allocation.allocatedMinutes)}`}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{context.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({weightPercentage}% weight)
                  </span>
                  {isCapped && (
                    <span
                      className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-1.5 py-0.5 rounded"
                      title={`Capped at maximum of ${formatDuration(context.maxDuration!)}`}
                    >
                      max
                    </span>
                  )}
                </div>
                <span className="font-mono">
                  {formatDuration(allocation.allocatedMinutes)}
                </span>
              </div>
              <div
                className="h-2 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${percentage}% of session time`}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isCapped ? 'bg-yellow-500' : 'bg-primary'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total validation */}
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span
          className={cn(
            'font-mono font-medium',
            result.totalAllocated === sessionMinutes
              ? 'text-foreground'
              : 'text-destructive'
          )}
        >
          {formatDuration(result.totalAllocated)}
          {result.totalAllocated !== sessionMinutes && (
            <span className="text-destructive ml-2">
              (should be {formatDuration(sessionMinutes)})
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
