'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { formatTime, calculateRemainingSeconds, getElapsedSeconds } from '@/lib/timer';
import { cn, getProgressColorClass } from '@/lib/utils';
import { getTimeProgress } from '@/lib/dates';
import { Progress } from '@/components/ui/progress';

interface ContextTimerProps {
  allocatedMinutes: number;
  usedMinutes: number;
  contextStartedAt: string | null;
  isPaused: boolean;
  onTimeExhausted?: () => void;
  className?: string;
}

export function ContextTimer({
  allocatedMinutes,
  usedMinutes,
  contextStartedAt,
  isPaused,
  onTimeExhausted,
  className,
}: ContextTimerProps) {
  const [tick, setTick] = useState(0);
  const hasNotifiedRef = useRef(false);

  // Reset notification flag when context changes
  useEffect(() => {
    hasNotifiedRef.current = false;
  }, [contextStartedAt]);

  // Timer tick effect - just triggers re-render, doesn't store elapsed time
  useEffect(() => {
    if (isPaused || !contextStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, contextStartedAt]);

  // Calculate elapsed time on each render (not stored in state)
  const elapsedSeconds = useMemo(() => {
    if (!contextStartedAt) return 0;
    // Force recalculation on tick change
    void tick;
    return getElapsedSeconds(contextStartedAt);
  }, [contextStartedAt, tick]);

  const remainingSeconds = calculateRemainingSeconds(
    allocatedMinutes,
    usedMinutes,
    elapsedSeconds
  );

  const isOvertime = remainingSeconds < 0;

  // Calculate current used minutes including elapsed time
  const currentUsedMinutes = usedMinutes + (elapsedSeconds / 60);
  const { percentage, status } = getTimeProgress(allocatedMinutes, currentUsedMinutes);
  const colors = getProgressColorClass(status);

  // Notify when time is exhausted (only once per context activation)
  useEffect(() => {
    if (isOvertime && !hasNotifiedRef.current && onTimeExhausted) {
      hasNotifiedRef.current = true;
      onTimeExhausted();
    }
  }, [isOvertime, onTimeExhausted]);

  // Clamp percentage for display
  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'font-mono text-4xl font-bold tabular-nums',
          isOvertime && 'text-destructive animate-pulse-slow',
          colors.text
        )}
        role="timer"
        aria-label={`Context time remaining: ${formatTime(remainingSeconds)}`}
      >
        {formatTime(remainingSeconds)}
      </div>

      <div className={cn(isPaused && 'opacity-60')}>
        <Progress
          value={displayPercentage}
          className={cn('h-2', colors.bg)}
          indicatorClassName={cn(
            colors.bar,
            status === 'overtime' && 'animate-pulse-slow',
            isPaused && 'transition-none'
          )}
        />
      </div>
    </div>
  );
}
