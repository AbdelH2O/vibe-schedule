'use client';

import { useCallback, useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useStore } from '@/lib/store';
import { formatDuration } from '@/lib/allocation';
import { getElapsedSeconds } from '@/lib/timer';
import { cn, getProgressColorClass } from '@/lib/utils';
import { getTimeProgress } from '@/lib/dates';
import { getContextColor } from '@/lib/colors';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Clock, Check } from 'lucide-react';
import type { Session } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContextDropdownProps {
  session: Session;
}

export interface ContextDropdownRef {
  open: () => void;
}

export const ContextDropdown = forwardRef<ContextDropdownRef, ContextDropdownProps>(
  function ContextDropdown({ session }, ref) {
    const { getContextById, switchContext } = useStore();
    const [tick, setTick] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const isPaused = session.status === 'paused';

    // Expose open method via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
      },
    }));

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
        setIsOpen(false);
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

    // Get active context info for trigger display
    const activeItem = contextItems.find((item) => item.isActive);
    const activeContext = activeItem?.context;
    const activeColors = activeContext ? getContextColor(activeContext.color) : getContextColor('blue');

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            ref={triggerRef}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
              'bg-card border hover:bg-muted/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isPaused && 'opacity-60'
            )}
            disabled={isPaused}
          >
            {/* Color dot */}
            <span
              className={cn('shrink-0 size-3 rounded-full', activeColors.dot)}
              aria-hidden="true"
            />

            {/* Context name and time */}
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">
                {activeContext?.name ?? 'Unknown Context'}
              </span>
              {activeItem && (
                <span
                  className={cn(
                    'text-xs font-mono tabular-nums',
                    activeItem.isOvertime ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  <Clock className="inline size-3 mr-1" aria-hidden="true" />
                  {activeItem.remaining >= 0
                    ? formatDuration(Math.round(activeItem.remaining))
                    : `+${formatDuration(Math.round(Math.abs(activeItem.remaining)))}`}
                  {' remaining'}
                </span>
              )}
            </div>

            <ChevronDown className="size-4 text-muted-foreground ml-auto" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-72">
          <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
            Switch Context
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
              c
            </kbd>
          </div>

          {contextItems.map(({ allocation, context, isActive, remaining, isOvertime, progress }) => {
            const colors = getProgressColorClass(progress.status);
            const displayPercentage = Math.min(progress.percentage, 100);
            const contextColors = getContextColor(context?.color ?? 'blue');

            return (
              <DropdownMenuItem
                key={allocation.contextId}
                onClick={() => handleSwitchContext(allocation.contextId)}
                disabled={isActive}
                className={cn(
                  'flex flex-col items-stretch gap-1 p-3 cursor-pointer',
                  isActive && 'bg-primary/5'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Color dot */}
                    <span
                      className={cn('shrink-0 size-2.5 rounded-full', contextColors.dot)}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-sm">{context?.name ?? 'Unknown'}</span>
                  </div>
                  {isActive && <Check className="size-4 text-primary" aria-hidden="true" />}
                </div>

                <div className="flex items-center justify-between pl-4.5">
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(allocation.allocatedMinutes)} allocated
                  </span>
                  <span
                    className={cn(
                      'text-xs font-mono tabular-nums',
                      isOvertime ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {remaining >= 0
                      ? formatDuration(Math.round(remaining))
                      : `+${formatDuration(Math.round(Math.abs(remaining)))}`}
                  </span>
                </div>

                {/* Mini progress bar */}
                <div className="pl-4.5 pt-1">
                  <Progress
                    value={displayPercentage}
                    className={cn('h-1', colors.bg)}
                    indicatorClassName={cn(
                      colors.bar,
                      progress.status === 'overtime' && 'animate-pulse-slow'
                    )}
                  />
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
