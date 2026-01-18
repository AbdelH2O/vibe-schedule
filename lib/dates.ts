// Date utility functions for countdown calculations

/**
 * Calculate days remaining until a target date
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Number of days remaining (negative if overdue)
 */
export function getDaysRemaining(dateString: string): number {
  const target = new Date(dateString);
  const today = new Date();
  // Normalize to start of day for accurate day comparison
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format countdown for display
 * @param days - Number of days remaining
 * @returns Formatted string for display
 */
export function formatCountdown(days: number): string {
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`;
  }
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return '1 day';
  }
  return `${days} days`;
}

/**
 * Determine the visual status of a date countdown
 * @param days - Number of days remaining
 * @returns Status for styling: 'overdue' | 'soon' | 'upcoming'
 */
export function getCountdownStatus(days: number): 'overdue' | 'soon' | 'upcoming' {
  if (days < 0) return 'overdue';
  if (days <= 7) return 'soon';
  return 'upcoming';
}

/**
 * Check if any important dates are approaching (within 7 days)
 * @param dates - Array of date strings
 * @returns true if any date is within 7 days or overdue
 */
export function hasUpcomingDeadline(dates: string[]): boolean {
  return dates.some((date) => getDaysRemaining(date) <= 7);
}

import type { DeadlineUrgency, CountdownDisplay, TimeProgress, TimeProgressStatus } from './types';

/**
 * Get the urgency level for a deadline based on days remaining
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns DeadlineUrgency level
 */
export function getDeadlineUrgency(dateString: string): DeadlineUrgency {
  const days = getDaysRemaining(dateString);

  if (days < 0) return 'overdue';
  if (days === 0) return 'urgent'; // today
  if (days <= 3) return 'warning'; // 1-3 days
  return 'neutral'; // 4+ days
}

/**
 * Get hours remaining until a deadline (for same-day deadlines)
 * @param dateString - ISO date string
 * @returns Hours remaining, or null if more than 24 hours away
 */
export function getHoursRemaining(dateString: string): number | null {
  const target = new Date(dateString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  // Only return hours if within 24 hours
  if (diffHours > 0 && diffHours <= 24) {
    return diffHours;
  }
  return null;
}

/**
 * Format a countdown for display with urgency information
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns CountdownDisplay with text and urgency level
 */
export function formatCountdownWithUrgency(dateString: string): CountdownDisplay {
  const days = getDaysRemaining(dateString);
  const urgency = getDeadlineUrgency(dateString);

  // Check for hours if within same day or next day
  if (days >= 0 && days <= 1) {
    const hours = getHoursRemaining(dateString);
    if (hours !== null && hours <= 24) {
      return {
        text: hours === 1 ? '1 hour' : `${hours} hours`,
        urgency
      };
    }
  }

  // Standard day-based countdown
  if (days < 0) {
    return {
      text: 'Overdue',
      urgency
    };
  }
  if (days === 0) {
    return { text: 'Today', urgency };
  }
  if (days === 1) {
    return { text: '1 day', urgency };
  }
  if (days <= 7) {
    return { text: `${days} days`, urgency };
  }
  if (days <= 14) {
    const weeks = Math.floor(days / 7);
    return { text: weeks === 1 ? 'in 1 week' : `in ${weeks} weeks`, urgency };
  }
  if (days <= 30) {
    const weeks = Math.round(days / 7);
    return { text: `in ${weeks} weeks`, urgency };
  }

  // More than a month
  const months = Math.round(days / 30);
  return { text: months === 1 ? 'in 1 month' : `in ${months} months`, urgency };
}

/**
 * Calculate time progress for visualizations
 * @param allocated - Allocated minutes
 * @param used - Used minutes
 * @returns TimeProgress with percentage, status, and remaining time
 */
export function getTimeProgress(allocated: number, used: number): TimeProgress {
  if (allocated <= 0) {
    return { percentage: 0, status: 'normal', remaining: 0 };
  }

  const remaining = allocated - used;
  const percentage = (used / allocated) * 100;

  let status: TimeProgressStatus;
  if (remaining < 0) {
    status = 'overtime';
  } else if (percentage >= 90) {
    status = 'urgent';
  } else if (percentage >= 75) {
    status = 'warning';
  } else {
    status = 'normal';
  }

  return { percentage, status, remaining };
}
