import { describe, it, expect } from 'vitest';
import {
  generatePosition,
  generateInitialPositions,
  calculateNewPosition,
  getLastPosition,
  generateEndPosition,
} from '../position';

// Helper for comparing positions (uses raw string comparison like the library)
const isBefore = (a: string, b: string) => a < b;
const isAfter = (a: string, b: string) => a > b;

describe('Position Utilities', () => {
  describe('generatePosition', () => {
    it('should generate position at start when before is null', () => {
      const pos = generatePosition(null, 'a1');
      expect(isBefore(pos, 'a1')).toBe(true);
    });

    it('should generate position at end when after is null', () => {
      const pos = generatePosition('a0', null);
      expect(isAfter(pos, 'a0')).toBe(true);
    });

    it('should generate position between two existing positions', () => {
      const pos = generatePosition('a0', 'a2');
      expect(isAfter(pos, 'a0')).toBe(true);
      expect(isBefore(pos, 'a2')).toBe(true);
    });

    it('should generate initial position when both are null', () => {
      const pos = generatePosition(null, null);
      expect(typeof pos).toBe('string');
      expect(pos.length).toBeGreaterThan(0);
    });
  });

  describe('generateInitialPositions', () => {
    it('should generate correct count of positions', () => {
      const positions = generateInitialPositions(5);
      expect(positions).toHaveLength(5);
    });

    it('should generate positions in sorted order', () => {
      const positions = generateInitialPositions(5);
      // Use raw string comparison for sorting (as the library expects)
      const sorted = [...positions].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      expect(positions).toEqual(sorted);
    });

    it('should return empty array for count 0', () => {
      const positions = generateInitialPositions(0);
      expect(positions).toEqual([]);
    });

    it('should generate unique positions', () => {
      const positions = generateInitialPositions(10);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(10);
    });
  });

  describe('calculateNewPosition', () => {
    const items = [
      { id: 'a', position: 'a0' },
      { id: 'b', position: 'a1' },
      { id: 'c', position: 'a2' },
      { id: 'd', position: 'a3' },
    ];

    it('should return current position when activeId equals overId', () => {
      const pos = calculateNewPosition(items, 'b', 'b');
      expect(pos).toBe('a1');
    });

    it('should calculate position when moving down in the list', () => {
      // Moving 'a' (position 0) to after 'c' (position 2)
      const pos = calculateNewPosition(items, 'a', 'c');
      // Should be after 'c' (a2) and before 'd' (a3)
      expect(isAfter(pos, 'a2')).toBe(true);
      expect(isBefore(pos, 'a3')).toBe(true);
    });

    it('should calculate position when moving up in the list', () => {
      // Moving 'c' (position 2) to before 'a' (position 0)
      const pos = calculateNewPosition(items, 'c', 'a');
      // Should be before 'a' (a0)
      expect(isBefore(pos, 'a0')).toBe(true);
    });

    it('should handle moving to the first position', () => {
      // Moving 'd' (position 3) to before 'a' (position 0)
      const pos = calculateNewPosition(items, 'd', 'a');
      expect(isBefore(pos, 'a0')).toBe(true);
    });

    it('should handle moving to the last position', () => {
      // Moving 'a' (position 0) to after 'd' (position 3)
      const pos = calculateNewPosition(items, 'a', 'd');
      expect(isAfter(pos, 'a3')).toBe(true);
    });

    it('should return a valid position when item not found', () => {
      const pos = calculateNewPosition(items, 'nonexistent', 'a');
      expect(typeof pos).toBe('string');
    });

    it('should handle single item list', () => {
      const singleItem = [{ id: 'only', position: 'a0' }];
      const pos = calculateNewPosition(singleItem, 'only', 'only');
      expect(pos).toBe('a0');
    });

    it('should handle adjacent swaps correctly', () => {
      // Moving 'b' to position of 'c' (swap down by one)
      const pos = calculateNewPosition(items, 'b', 'c');
      // After moving, 'b' should be after 'c' (a2) and before 'd' (a3)
      expect(isAfter(pos, 'a2')).toBe(true);
      expect(isBefore(pos, 'a3')).toBe(true);
    });
  });

  describe('getLastPosition', () => {
    it('should return null for empty array', () => {
      const result = getLastPosition([]);
      expect(result).toBeNull();
    });

    it('should return the last position in a sorted array', () => {
      const items = [
        { position: 'a0' },
        { position: 'a2' },
        { position: 'a1' },
      ];
      const result = getLastPosition(items);
      expect(result).toBe('a2');
    });

    it('should handle single item', () => {
      const items = [{ position: 'a0' }];
      const result = getLastPosition(items);
      expect(result).toBe('a0');
    });
  });

  describe('generateEndPosition', () => {
    it('should generate position after last item', () => {
      const items = [
        { position: 'a0' },
        { position: 'a1' },
      ];
      const pos = generateEndPosition(items);
      expect(isAfter(pos, 'a1')).toBe(true);
    });

    it('should generate initial position for empty array', () => {
      const pos = generateEndPosition([]);
      expect(typeof pos).toBe('string');
      expect(pos.length).toBeGreaterThan(0);
    });

    it('should handle unsorted input', () => {
      const items = [
        { position: 'a2' },
        { position: 'a0' },
        { position: 'a1' },
      ];
      const pos = generateEndPosition(items);
      // Should be after 'a2' (the last when sorted)
      expect(isAfter(pos, 'a2')).toBe(true);
    });
  });
});
