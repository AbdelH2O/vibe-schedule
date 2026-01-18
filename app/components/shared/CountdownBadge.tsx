'use client';

import { formatCountdownWithUrgency } from '@/lib/dates';
import { getUrgencyColorClass, cn } from '@/lib/utils';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import type { DeadlineUrgency } from '@/lib/types';

interface CountdownBadgeProps {
  date: string;
  className?: string;
  showIcon?: boolean;
}

function getUrgencyIcon(urgency: DeadlineUrgency) {
  switch (urgency) {
    case 'overdue':
      return <AlertCircle className="h-3 w-3" />;
    case 'urgent':
      return <AlertTriangle className="h-3 w-3" />;
    case 'warning':
      return <Clock className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
}

export function CountdownBadge({ date, className, showIcon = true }: CountdownBadgeProps) {
  const { text, urgency } = formatCountdownWithUrgency(date);
  const colors = getUrgencyColorClass(urgency);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        urgency === 'overdue' && 'animate-pulse-slow',
        className
      )}
      role="status"
      aria-label={`Deadline: ${text}`}
    >
      {showIcon && getUrgencyIcon(urgency)}
      <span>{text}</span>
    </span>
  );
}
