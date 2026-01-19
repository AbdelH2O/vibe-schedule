'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { formatTime, calculateRemainingSeconds, getElapsedSeconds } from '@/lib/timer';
import { cn, getProgressColorClass } from '@/lib/utils';
import { getTimeProgress } from '@/lib/dates';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Pencil, Plus, Minus } from 'lucide-react';

interface ContextTimerProps {
  allocatedMinutes: number;
  usedMinutes: number;
  adjustedMinutes?: number;
  contextStartedAt: string | null;
  isPaused: boolean;
  onTimeExhausted?: () => void;
  className?: string;
  contextId?: string;
  contextName?: string;
  onAdjustTime?: (contextId: string, newRemainingMinutes: number, currentElapsedMinutes: number) => void;
}

export function ContextTimer({
  allocatedMinutes,
  usedMinutes,
  adjustedMinutes = 0,
  contextStartedAt,
  isPaused,
  onTimeExhausted,
  className,
  contextId,
  contextName,
  onAdjustTime,
}: ContextTimerProps) {
  const [tick, setTick] = useState(0);
  const hasNotifiedRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

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

  // Effective allocation includes runtime adjustments
  const effectiveAllocatedMinutes = allocatedMinutes + adjustedMinutes;

  const remainingSeconds = calculateRemainingSeconds(
    allocatedMinutes,
    usedMinutes,
    elapsedSeconds,
    adjustedMinutes
  );

  const isOvertime = remainingSeconds < 0;
  const remainingMinutes = remainingSeconds / 60;
  const currentElapsedMinutes = elapsedSeconds / 60;

  // Handlers for time editing
  const handleOpenEdit = useCallback(() => {
    setIsEditing(true);
    setEditValue(Math.max(0, Math.round(remainingMinutes)).toString());
  }, [remainingMinutes]);

  const handleCloseEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  const handleConfirmEdit = useCallback(() => {
    if (!contextId || !onAdjustTime) return;
    const newRemaining = Math.max(0, parseInt(editValue, 10) || 0);
    onAdjustTime(contextId, newRemaining, currentElapsedMinutes);
    handleCloseEdit();
  }, [contextId, editValue, currentElapsedMinutes, onAdjustTime, handleCloseEdit]);

  const handleQuickAdjust = useCallback((delta: number) => {
    const current = parseInt(editValue, 10) || 0;
    const maxVal = Math.max(0, Math.round(allocatedMinutes - currentElapsedMinutes));
    setEditValue(Math.max(0, Math.min(maxVal, current + delta)).toString());
  }, [editValue, allocatedMinutes, currentElapsedMinutes]);

  // Maximum remaining time is capped at allocated - elapsed (when usedMinutes = 0)
  const maxRemaining = Math.max(0, Math.round(allocatedMinutes - currentElapsedMinutes));
  const canEdit = !!contextId && !!onAdjustTime;

  // Calculate current used minutes including elapsed time
  const currentUsedMinutes = usedMinutes + (elapsedSeconds / 60);
  const { percentage, status } = getTimeProgress(effectiveAllocatedMinutes, currentUsedMinutes);
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
      <div className="flex items-center justify-center gap-2">
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

        {/* Edit time button */}
        {canEdit && (
          <Popover open={isEditing} onOpenChange={(open) => {
            if (open) {
              handleOpenEdit();
            } else {
              handleCloseEdit();
            }
          }}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={`Edit time for ${contextName ?? 'context'}`}
              >
                <Pencil className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side="right" align="center">
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Adjust remaining{contextName ? ` for ${contextName}` : ''}
                </div>

                {/* Time input */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={maxRemaining}
                    value={editValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setEditValue(Math.min(maxRemaining, val).toString());
                    }}
                    className="w-20 text-center font-mono"
                    aria-label="Minutes remaining"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Max recoverable: {maxRemaining} min
                </div>

                {/* Quick adjust buttons */}
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdjust(-15)}
                    className="text-xs"
                  >
                    <Minus className="size-3 mr-1" />15
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdjust(-5)}
                    className="text-xs"
                  >
                    <Minus className="size-3 mr-1" />5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdjust(5)}
                    className="text-xs"
                  >
                    <Plus className="size-3 mr-1" />5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdjust(15)}
                    className="text-xs"
                  >
                    <Plus className="size-3 mr-1" />15
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmEdit}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
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
