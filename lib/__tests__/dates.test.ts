import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDaysRemaining,
  formatCountdown,
  getCountdownStatus,
  hasUpcomingDeadline,
  getDeadlineUrgency,
  formatCountdownWithUrgency,
  getTimeProgress,
} from '../dates';

describe('Date Utilities', () => {
  beforeEach(() => {
    // Mock Date to 2026-01-25 at noon for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-25T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDaysRemaining', () => {
    it('should return 0 for today', () => {
      expect(getDaysRemaining('2026-01-25')).toBe(0);
    });

    it('should return positive for future dates', () => {
      expect(getDaysRemaining('2026-01-28')).toBe(3);
    });

    it('should return negative for past dates', () => {
      expect(getDaysRemaining('2026-01-22')).toBe(-3);
    });

    it('should return 1 for tomorrow', () => {
      expect(getDaysRemaining('2026-01-26')).toBe(1);
    });

    it('should return -1 for yesterday', () => {
      expect(getDaysRemaining('2026-01-24')).toBe(-1);
    });
  });

  describe('formatCountdown', () => {
    it('should format overdue single day', () => {
      expect(formatCountdown(-1)).toBe('1 day overdue');
    });

    it('should format overdue multiple days', () => {
      expect(formatCountdown(-5)).toBe('5 days overdue');
    });

    it('should format today', () => {
      expect(formatCountdown(0)).toBe('Today');
    });

    it('should format single day', () => {
      expect(formatCountdown(1)).toBe('1 day');
    });

    it('should format multiple days', () => {
      expect(formatCountdown(7)).toBe('7 days');
    });
  });

  describe('getCountdownStatus', () => {
    it('should return overdue for negative days', () => {
      expect(getCountdownStatus(-1)).toBe('overdue');
      expect(getCountdownStatus(-10)).toBe('overdue');
    });

    it('should return soon for 0-7 days', () => {
      expect(getCountdownStatus(0)).toBe('soon');
      expect(getCountdownStatus(7)).toBe('soon');
    });

    it('should return upcoming for 8+ days', () => {
      expect(getCountdownStatus(8)).toBe('upcoming');
      expect(getCountdownStatus(30)).toBe('upcoming');
    });
  });

  describe('hasUpcomingDeadline', () => {
    it('should return true for dates within 7 days', () => {
      expect(hasUpcomingDeadline(['2026-01-28'])).toBe(true);
    });

    it('should return true for overdue dates', () => {
      expect(hasUpcomingDeadline(['2026-01-20'])).toBe(true);
    });

    it('should return false for dates more than 7 days away', () => {
      expect(hasUpcomingDeadline(['2026-02-10'])).toBe(false);
    });

    it('should return true if any date is within 7 days', () => {
      expect(hasUpcomingDeadline(['2026-02-15', '2026-01-27'])).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(hasUpcomingDeadline([])).toBe(false);
    });
  });

  describe('getDeadlineUrgency', () => {
    it('should return overdue for past dates', () => {
      expect(getDeadlineUrgency('2026-01-20')).toBe('overdue');
      expect(getDeadlineUrgency('2026-01-24')).toBe('overdue');
    });

    it('should return urgent for today', () => {
      expect(getDeadlineUrgency('2026-01-25')).toBe('urgent');
    });

    it('should return warning for 1-3 days', () => {
      expect(getDeadlineUrgency('2026-01-26')).toBe('warning');
      expect(getDeadlineUrgency('2026-01-27')).toBe('warning');
      expect(getDeadlineUrgency('2026-01-28')).toBe('warning');
    });

    it('should return neutral for 4+ days', () => {
      expect(getDeadlineUrgency('2026-01-29')).toBe('neutral');
      expect(getDeadlineUrgency('2026-02-15')).toBe('neutral');
    });
  });

  describe('formatCountdownWithUrgency', () => {
    it('should return Overdue for past dates', () => {
      const result = formatCountdownWithUrgency('2026-01-20');
      expect(result.text).toBe('Overdue');
      expect(result.urgency).toBe('overdue');
    });

    it('should return Today for current date', () => {
      const result = formatCountdownWithUrgency('2026-01-25');
      expect(result.text).toBe('Today');
      expect(result.urgency).toBe('urgent');
    });

    it('should return hours or 1 day for tomorrow (within 24h)', () => {
      const result = formatCountdownWithUrgency('2026-01-26');
      // When deadline is within 24 hours, function returns hours instead of days
      // At noon on Jan 25, deadline of Jan 26 (midnight) is ~12 hours away
      expect(result.text).toMatch(/^\d+ hours?$/);
      expect(result.urgency).toBe('warning');
    });

    it('should return days for 2-7 days', () => {
      const result = formatCountdownWithUrgency('2026-01-28');
      expect(result.text).toBe('3 days');
      expect(result.urgency).toBe('warning');
    });

    it('should return weeks for 8-14 days', () => {
      const result = formatCountdownWithUrgency('2026-02-02');
      expect(result.text).toBe('in 1 week');
      expect(result.urgency).toBe('neutral');
    });

    it('should return weeks for 15-30 days', () => {
      const result = formatCountdownWithUrgency('2026-02-15');
      expect(result.text).toBe('in 3 weeks');
      expect(result.urgency).toBe('neutral');
    });

    it('should return months for 31+ days', () => {
      const result = formatCountdownWithUrgency('2026-03-01');
      expect(result.text).toBe('in 1 month');
      expect(result.urgency).toBe('neutral');
    });
  });

  describe('getTimeProgress', () => {
    it('should return normal status under 75%', () => {
      const result = getTimeProgress(100, 50);
      expect(result.status).toBe('normal');
      expect(result.percentage).toBe(50);
      expect(result.remaining).toBe(50);
    });

    it('should return warning status at 75-89%', () => {
      const result = getTimeProgress(100, 80);
      expect(result.status).toBe('warning');
      expect(result.percentage).toBe(80);
      expect(result.remaining).toBe(20);
    });

    it('should return urgent status at 90-99%', () => {
      const result = getTimeProgress(100, 95);
      expect(result.status).toBe('urgent');
      expect(result.percentage).toBe(95);
      expect(result.remaining).toBe(5);
    });

    it('should return overtime status over 100%', () => {
      const result = getTimeProgress(100, 110);
      expect(result.status).toBe('overtime');
      expect(result.percentage).toBeCloseTo(110);
      expect(result.remaining).toBe(-10);
    });

    it('should handle zero allocation', () => {
      const result = getTimeProgress(0, 0);
      expect(result.status).toBe('normal');
      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(0);
    });

    it('should handle exact 75% threshold', () => {
      const result = getTimeProgress(100, 75);
      expect(result.status).toBe('warning');
    });

    it('should handle exact 90% threshold', () => {
      const result = getTimeProgress(100, 90);
      expect(result.status).toBe('urgent');
    });

    it('should handle exact 100% threshold', () => {
      const result = getTimeProgress(100, 100);
      // remaining is 0, not negative, so it should be urgent not overtime
      expect(result.status).toBe('urgent');
      expect(result.remaining).toBe(0);
    });
  });
});
