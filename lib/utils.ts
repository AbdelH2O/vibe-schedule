import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DeadlineUrgency, TimeProgressStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get Tailwind color classes for deadline urgency
 * @param urgency - DeadlineUrgency level
 * @returns Object with text and background color classes
 */
export function getUrgencyColorClass(urgency: DeadlineUrgency): { text: string; bg: string } {
  switch (urgency) {
    case 'overdue':
      return { text: 'text-destructive', bg: 'bg-destructive/10' };
    case 'urgent':
      return { text: 'text-destructive', bg: 'bg-destructive/10' };
    case 'warning':
      return { text: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' };
    case 'neutral':
    default:
      return { text: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

/**
 * Get Tailwind color classes for time progress status
 * @param status - TimeProgressStatus level
 * @returns Object with text, background, and progress bar color classes
 */
export function getProgressColorClass(status: TimeProgressStatus): { text: string; bg: string; bar: string } {
  switch (status) {
    case 'overtime':
      return { text: 'text-destructive', bg: 'bg-destructive/10', bar: 'bg-destructive' };
    case 'urgent':
      return { text: 'text-destructive', bg: 'bg-destructive/10', bar: 'bg-destructive' };
    case 'warning':
      return { text: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', bar: 'bg-amber-500' };
    case 'normal':
    default:
      return { text: 'text-foreground', bg: 'bg-muted', bar: 'bg-primary' };
  }
}
