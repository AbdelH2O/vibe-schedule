'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { formatDuration } from '@/lib/allocation';
import { getElapsedSeconds } from '@/lib/timer';
import { cn, getProgressColorClass } from '@/lib/utils';
import { getTimeProgress } from '@/lib/dates';
import { Progress } from '@/components/ui/progress';
import type { Session } from '@/lib/types';

interface ContextSwitcherProps {
  session: Session;
}

export function ContextSwitcher({ session }: ContextSwitcherProps) {
  const { getContextById, switchContext } = useStore();
  const [tick, setTick] = useState(0);

  const isPaused = session.status === 'paused';

  // Timer tick for updating elapsed display
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Calculate current elapsed for active context
  const currentElapsedMinutes = useMemo(() => {
    if (!session.contextStartedAt || isPaused) return 0;
    void tick;
    return getElapsedSeconds(session.contextStartedAt) / 60;
  }, [session.contextStartedAt, isPaused, tick]);

  const handleSwitchContext = useCallback(
    (newContextId: string) => {
      if (newContextId === session.activeContextId) return;

      // Calculate total used time for current context
      const currentAllocation = session.allocations.find(
        (a) => a.contextId === session.activeContextId
      );
      const totalUsedMinutes =
        (currentAllocation?.usedMinutes ?? 0) + currentElapsedMinutes;

      switchContext(newContextId, totalUsedMinutes);
    },
    [session.activeContextId, session.allocations, currentElapsedMinutes, switchContext]
  );

  // Calculate display values for each context
  const contextItems = useMemo(() => {
    return session.allocations.map((alloc) => {
      const ctx = getContextById(alloc.contextId);
      const isActive = alloc.contextId === session.activeContextId;

      // For active context, add current elapsed time
      const displayUsed = isActive
        ? alloc.usedMinutes + currentElapsedMinutes
        : alloc.usedMinutes;

      const remaining = alloc.allocatedMinutes - displayUsed;
      const isOvertime = remaining < 0;

      // Calculate progress for this allocation
      const progress = getTimeProgress(alloc.allocatedMinutes, displayUsed);

      return {
        allocation: alloc,
        context: ctx,
        isActive,
        displayUsed,
        remaining,
        isOvertime,
        progress,
      };
    });
  }, [session.allocations, session.activeContextId, currentElapsedMinutes, getContextById]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="font-medium mb-4">Contexts</h3>
      <ul className="space-y-2" role="listbox" aria-label="Available contexts">
        {contextItems.map(({ allocation, context, isActive, remaining, isOvertime, progress }) => {
          const colors = getProgressColorClass(progress.status);
          const displayPercentage = Math.min(progress.percentage, 100);

          return (
            <li key={allocation.contextId}>
              <button
                type="button"
                onClick={() => handleSwitchContext(allocation.contextId)}
                disabled={isActive || isPaused}
                className={cn(
                  'w-full p-3 rounded-md text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary/10 border border-primary/20 cursor-default'
                    : 'bg-muted/50 hover:bg-muted cursor-pointer',
                  isPaused && !isActive && 'opacity-50 cursor-not-allowed'
                )}
                role="option"
                aria-selected={isActive}
                aria-disabled={isActive || isPaused}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{context?.name ?? 'Unknown'}</div>
                  {isActive && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(allocation.allocatedMinutes)}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-mono tabular-nums',
                      isOvertime ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {remaining >= 0
                      ? formatDuration(Math.round(remaining))
                      : `+${formatDuration(Math.round(Math.abs(remaining)))}`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className={cn('mt-2', isPaused && 'opacity-60')}>
                  <Progress
                    value={displayPercentage}
                    className={cn('h-1.5', colors.bg)}
                    indicatorClassName={cn(
                      colors.bar,
                      progress.status === 'overtime' && 'animate-pulse-slow'
                    )}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
