// Timer utilities for Working Mode

/**
 * Format seconds as MM:SS or HH:MM:SS
 * For negative values (overtime), prefix with +
 */
export function formatTime(totalSeconds: number): string {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = Math.floor(absSeconds % 60);

  const prefix = isNegative ? '+' : '';

  if (hours > 0) {
    return `${prefix}${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${prefix}${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate remaining seconds for a context
 * Returns negative values for overtime
 */
export function calculateRemainingSeconds(
  allocatedMinutes: number,
  usedMinutes: number,
  elapsedSeconds: number
): number {
  const allocatedSeconds = allocatedMinutes * 60;
  const usedSeconds = usedMinutes * 60;
  return allocatedSeconds - usedSeconds - elapsedSeconds;
}

/**
 * Calculate elapsed seconds since a timestamp
 */
export function getElapsedSeconds(startTimestamp: string): number {
  const startTime = new Date(startTimestamp).getTime();
  const now = Date.now();
  return Math.floor((now - startTime) / 1000);
}

/**
 * Calculate total session time remaining in seconds
 */
export function calculateSessionRemainingSeconds(
  totalDurationMinutes: number,
  allocations: Array<{ usedMinutes: number }>,
  currentElapsedSeconds: number
): number {
  const totalSeconds = totalDurationMinutes * 60;
  const totalUsedSeconds = allocations.reduce(
    (sum, alloc) => sum + alloc.usedMinutes * 60,
    0
  );
  return totalSeconds - totalUsedSeconds - currentElapsedSeconds;
}
