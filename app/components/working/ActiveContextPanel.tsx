'use client';

import { ContextTimer } from './ContextTimer';
import { ContextDatesSection } from './ContextDatesSection';
import { formatDuration } from '@/lib/allocation';
import { useStore } from '@/lib/store';
import type { Context, ContextAllocation } from '@/lib/types';

interface ActiveContextPanelProps {
  context: Context;
  allocation: ContextAllocation;
  contextStartedAt: string | null;
  isPaused: boolean;
  isPausedByReminder?: boolean;
  onTimeExhausted?: () => void;
}

export function ActiveContextPanel({
  context,
  allocation,
  contextStartedAt,
  isPaused,
  isPausedByReminder,
  onTimeExhausted,
}: ActiveContextPanelProps) {
  const { adjustContextTime } = useStore();

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

      {/* Important dates section */}
      {context.importantDates && context.importantDates.length > 0 && (
        <ContextDatesSection importantDates={context.importantDates} />
      )}

      <div className="flex items-center justify-center py-8">
        <ContextTimer
          allocatedMinutes={allocation.allocatedMinutes}
          usedMinutes={allocation.usedMinutes}
          adjustedMinutes={allocation.adjustedMinutes ?? 0}
          contextStartedAt={contextStartedAt}
          isPaused={isPaused}
          onTimeExhausted={onTimeExhausted}
          contextId={allocation.contextId}
          contextName={context.name}
          onAdjustTime={adjustContextTime}
        />
      </div>

      {isPaused && (
        <div className="text-center text-muted-foreground text-sm">
          {isPausedByReminder ? 'Timer paused - Respond to reminder' : 'Timer paused'}
        </div>
      )}
    </div>
  );
}
