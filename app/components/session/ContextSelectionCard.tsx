'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { getContextColor } from '@/lib/colors';
import { formatDuration } from '@/lib/allocation';
import type { Context, ContextAllocation } from '@/lib/types';

interface ContextSelectionCardProps {
  context: Context;
  selected: boolean;
  onToggle: () => void;
  allocation: ContextAllocation | undefined;
  sessionMinutes: number;
}

export function ContextSelectionCard({
  context,
  selected,
  onToggle,
  allocation,
  sessionMinutes,
}: ContextSelectionCardProps) {
  const colors = getContextColor(context.color);

  const percentage = selected && allocation && sessionMinutes > 0
    ? Math.round((allocation.allocatedMinutes / sessionMinutes) * 100)
    : 0;

  // Check if this context is capped at maximum
  const isCapped = selected && allocation && context.maxDuration !== undefined &&
    allocation.allocatedMinutes >= context.maxDuration;

  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        'group relative rounded-lg border p-3 cursor-pointer transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'min-h-[44px]',
        selected
          ? 'bg-card border-border hover:bg-accent/50'
          : 'bg-muted/30 border-transparent opacity-60 hover:opacity-80 hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Include ${context.name} in session`}
        />

        <div
          className={cn(
            'size-3 rounded-full shrink-0 transition-colors duration-200',
            selected ? colors.dot : 'bg-muted-foreground/30'
          )}
          style={selected ? { background: colors.dotColor } : undefined}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'font-medium text-sm truncate transition-colors duration-200',
              selected ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {context.name}
            </span>

            {selected && allocation && (
              <div className="flex items-center gap-2 shrink-0">
                {isCapped && (
                  <span
                    className="text-xs bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded"
                    title={`Capped at maximum of ${formatDuration(context.maxDuration!)}`}
                  >
                    max
                  </span>
                )}
                <span className="font-mono text-sm text-foreground">
                  {formatDuration(allocation.allocatedMinutes)}
                </span>
              </div>
            )}
          </div>

          {/* Allocation progress bar */}
          {selected && allocation && (
            <div className="mt-2">
              <div
                className="h-1.5 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${percentage}% of session time`}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isCapped ? 'bg-yellow-500' : 'bg-primary'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Hint for unselected contexts */}
          {!selected && (
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click to include
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
