'use client';

import { Progress } from '@/components/ui/progress';
import { getTimeProgress } from '@/lib/dates';
import { getProgressColorClass, cn } from '@/lib/utils';
import type { TimeProgressStatus } from '@/lib/types';

interface TimeProgressBarProps {
  allocated: number; // minutes
  used: number; // minutes
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isPaused?: boolean;
}

function formatMinutes(minutes: number): string {
  const absMinutes = Math.abs(minutes);
  if (absMinutes < 60) {
    return `${Math.round(absMinutes)}m`;
  }
  const hours = Math.floor(absMinutes / 60);
  const mins = Math.round(absMinutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getStatusLabel(status: TimeProgressStatus, remaining: number): string {
  switch (status) {
    case 'overtime':
      return `${formatMinutes(Math.abs(remaining))} over`;
    case 'urgent':
      return `${formatMinutes(remaining)} left`;
    case 'warning':
      return `${formatMinutes(remaining)} left`;
    default:
      return `${formatMinutes(remaining)} left`;
  }
}

export function TimeProgressBar({
  allocated,
  used,
  className,
  showLabel = true,
  size = 'md',
  isPaused = false,
}: TimeProgressBarProps) {
  const { percentage, status, remaining } = getTimeProgress(allocated, used);
  const colors = getProgressColorClass(status);

  // Clamp percentage for display (allow up to 100% visually)
  const displayPercentage = Math.min(percentage, 100);

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('relative', isPaused && 'opacity-60')}>
        <Progress
          value={displayPercentage}
          className={cn(
            heightClass,
            colors.bg,
            'transition-all duration-300'
          )}
          indicatorClassName={cn(
            colors.bar,
            status === 'overtime' && 'animate-pulse-slow',
            isPaused && 'transition-none'
          )}
        />
      </div>

      {showLabel && (
        <div className={cn(
          'flex justify-between items-center mt-1 text-xs',
          colors.text
        )}>
          <span className={cn(
            status === 'overtime' && 'font-medium',
            isPaused && 'opacity-60'
          )}>
            {getStatusLabel(status, remaining)}
          </span>
          <span className="text-muted-foreground">
            {formatMinutes(used)} / {formatMinutes(allocated)}
          </span>
        </div>
      )}
    </div>
  );
}
