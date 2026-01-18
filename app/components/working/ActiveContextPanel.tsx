'use client';

import { ContextTimer } from './ContextTimer';
import { formatDuration } from '@/lib/allocation';
import type { Context, ContextAllocation } from '@/lib/types';

interface ActiveContextPanelProps {
  context: Context;
  allocation: ContextAllocation;
  contextStartedAt: string | null;
  isPaused: boolean;
  onTimeExhausted?: () => void;
}

export function ActiveContextPanel({
  context,
  allocation,
  contextStartedAt,
  isPaused,
  onTimeExhausted,
}: ActiveContextPanelProps) {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{context.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Allocated: {formatDuration(allocation.allocatedMinutes)}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Priority {context.priority}
        </div>
      </div>

      <div className="flex items-center justify-center py-8">
        <ContextTimer
          allocatedMinutes={allocation.allocatedMinutes}
          usedMinutes={allocation.usedMinutes}
          contextStartedAt={contextStartedAt}
          isPaused={isPaused}
          onTimeExhausted={onTimeExhausted}
        />
      </div>

      {isPaused && (
        <div className="text-center text-muted-foreground text-sm">
          Timer paused
        </div>
      )}
    </div>
  );
}
