/**
 * Position utilities for task ordering using fractional indexing.
 * Fractional indexing allows insertions between any two positions
 * without re-indexing other items.
 */

import { generateKeyBetween } from 'fractional-indexing';

/**
 * Generate a position key between two existing positions.
 * @param before - Position of item before, or null for start
 * @param after - Position of item after, or null for end
 */
export function generatePosition(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after);
}

/**
 * Generate initial positions for a list of items.
 * @param count - Number of positions to generate
 */
export function generateInitialPositions(count: number): string[] {
  const positions: string[] = [];
  let prev: string | null = null;
  for (let i = 0; i < count; i++) {
    const pos = generateKeyBetween(prev, null);
    positions.push(pos);
    prev = pos;
  }
  return positions;
}

/**
 * Calculate new position when moving an item in a sorted list.
 * @param sortedItems - Items sorted by position
 * @param activeId - ID of item being moved
 * @param overId - ID of item being dropped over
 */
export function calculateNewPosition(
  sortedItems: Array<{ id: string; position: string }>,
  activeId: string,
  overId: string
): string {
  const oldIndex = sortedItems.findIndex((item) => item.id === activeId);
  const newIndex = sortedItems.findIndex((item) => item.id === overId);

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return sortedItems[oldIndex]?.position ?? generateKeyBetween(null, null);
  }

  // Moving down in the list - place BEFORE the target item
  if (newIndex > oldIndex) {
    const before = sortedItems[newIndex - 1]?.position ?? null;
    const after = sortedItems[newIndex]?.position ?? null;
    return generateKeyBetween(before, after);
  }

  // Moving up in the list
  const beforePrev = sortedItems[newIndex - 1]?.position ?? null;
  const before = sortedItems[newIndex]?.position ?? null;
  return generateKeyBetween(beforePrev, before);
}

/**
 * Get the last position in a list of items.
 * Returns null if the list is empty.
 */
export function getLastPosition(items: Array<{ position: string }>): string | null {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => a.position.localeCompare(b.position));
  return sorted[sorted.length - 1].position;
}

/**
 * Generate a position at the end of a list.
 */
export function generateEndPosition(items: Array<{ position: string }>): string {
  const lastPos = getLastPosition(items);
  return generateKeyBetween(lastPos, null);
}
