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
