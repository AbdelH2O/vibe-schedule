// Time allocation algorithm for distributing session time across contexts

import type { Context, ContextAllocation } from './types';

// Warning types for allocation edge cases
export type AllocationWarningType =
  | 'over_committed_minimums'
  | 'under_utilized_maximums'
  | 'no_contexts';

export interface AllocationWarning {
  type: AllocationWarningType;
  message: string;
  details?: {
    excessMinutes?: number;
    unusedMinutes?: number;
    suggestedMinutes?: number;
  };
}

export interface AllocationResult {
  allocations: ContextAllocation[];
  totalAllocated: number;
  warnings: AllocationWarning[];
  isValid: boolean;
}

export interface AllocationInput {
  contexts: Pick<Context, 'id' | 'priority' | 'minDuration' | 'maxDuration' | 'weight'>[];
  sessionMinutes: number;
}

/**
 * Calculate time allocations for a session based on context constraints.
 *
 * Algorithm steps:
 * 1. Check for zero contexts
 * 2. Sum all minimums and check for over-commitment
 * 3. Allocate minimums to each context
 * 4. Calculate remaining time and weight ratios
 * 5. Distribute remaining time by weight ratio
 * 6. Enforce maximum caps with redistribution loop
 * 7. Round to whole minutes and adjust highest-priority for total match
 */
export function calculateAllocations(input: AllocationInput): AllocationResult {
  const { contexts, sessionMinutes } = input;
  const warnings: AllocationWarning[] = [];

  // Step 1: Check for zero contexts
  if (contexts.length === 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      warnings: [{
        type: 'no_contexts',
        message: 'No contexts defined. Create at least one context to start a session.',
      }],
      isValid: false,
    };
  }

  // Step 2: Sum all minimums and check for over-commitment
  const totalMinimums = contexts.reduce((sum, ctx) => sum + (ctx.minDuration ?? 0), 0);

  if (totalMinimums > sessionMinutes) {
    const excessMinutes = totalMinimums - sessionMinutes;
    warnings.push({
      type: 'over_committed_minimums',
      message: `Minimum durations exceed session time by ${excessMinutes} minutes.`,
      details: {
        excessMinutes,
        suggestedMinutes: totalMinimums,
      },
    });

    // Proceed with proportional reduction based on minimums
    const ratio = sessionMinutes / totalMinimums;
    const allocations = contexts.map(ctx => ({
      contextId: ctx.id,
      allocatedMinutes: Math.round((ctx.minDuration ?? 0) * ratio),
      usedMinutes: 0,
    }));

    // Adjust for rounding to ensure total matches
    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedMinutes, 0);
    if (totalAllocated !== sessionMinutes && allocations.length > 0) {
      const diff = sessionMinutes - totalAllocated;
      // Give adjustment to highest priority context
      const sortedByPriority = [...contexts].sort((a, b) => a.priority - b.priority);
      const highestPriorityId = sortedByPriority[0].id;
      const alloc = allocations.find(a => a.contextId === highestPriorityId);
      if (alloc) {
        alloc.allocatedMinutes += diff;
      }
    }

    return {
      allocations,
      totalAllocated: sessionMinutes,
      warnings,
      isValid: true, // Valid but with warning
    };
  }

  // Step 3: Allocate minimums to each context
  const workingAllocations = contexts.map(ctx => ({
    contextId: ctx.id,
    priority: ctx.priority,
    minDuration: ctx.minDuration ?? 0,
    maxDuration: ctx.maxDuration,
    weight: ctx.weight,
    allocated: ctx.minDuration ?? 0,
    capped: false,
  }));

  // Step 4: Calculate remaining time
  const remainingTime = sessionMinutes - totalMinimums;

  // Step 5: Distribute remaining time by weight ratio
  if (remainingTime > 0) {
    const uncappedContexts = workingAllocations.filter(a => !a.capped);
    const totalWeight = uncappedContexts.reduce((sum, a) => sum + a.weight, 0);

    if (totalWeight > 0) {
      for (const alloc of uncappedContexts) {
        const weightRatio = alloc.weight / totalWeight;
        alloc.allocated += remainingTime * weightRatio;
      }
    } else {
      // Equal distribution if all weights are zero
      const share = remainingTime / uncappedContexts.length;
      for (const alloc of uncappedContexts) {
        alloc.allocated += share;
      }
    }
  }

  // Step 6: Enforce maximum caps with redistribution loop
  let redistributionNeeded = true;
  let iterations = 0;
  const maxIterations = contexts.length + 1; // Prevent infinite loop

  while (redistributionNeeded && iterations < maxIterations) {
    redistributionNeeded = false;
    iterations++;

    for (const alloc of workingAllocations) {
      if (!alloc.capped && alloc.maxDuration !== undefined && alloc.allocated > alloc.maxDuration) {
        const excess = alloc.allocated - alloc.maxDuration;
        alloc.allocated = alloc.maxDuration;
        alloc.capped = true;
        redistributionNeeded = true;

        // Redistribute excess to uncapped contexts
        const uncappedContexts = workingAllocations.filter(a => !a.capped);
        if (uncappedContexts.length > 0) {
          const totalWeight = uncappedContexts.reduce((sum, a) => sum + a.weight, 0);

          if (totalWeight > 0) {
            for (const uncapped of uncappedContexts) {
              const weightRatio = uncapped.weight / totalWeight;
              uncapped.allocated += excess * weightRatio;
            }
          } else {
            const share = excess / uncappedContexts.length;
            for (const uncapped of uncappedContexts) {
              uncapped.allocated += share;
            }
          }
        }
      }
    }
  }

  // Check for under-utilized maximums (all contexts capped but time remaining)
  const totalAllocatedBeforeRounding = workingAllocations.reduce((sum, a) => sum + a.allocated, 0);
  if (totalAllocatedBeforeRounding < sessionMinutes - 0.5) {
    const unusedMinutes = sessionMinutes - totalAllocatedBeforeRounding;
    warnings.push({
      type: 'under_utilized_maximums',
      message: `Maximum caps prevent using ${Math.round(unusedMinutes)} minutes of session time.`,
      details: {
        unusedMinutes: Math.round(unusedMinutes),
      },
    });
  }

  // Step 7: Round to whole minutes and adjust highest-priority for total match
  const allocations: ContextAllocation[] = workingAllocations.map(a => ({
    contextId: a.contextId,
    allocatedMinutes: Math.round(a.allocated),
    usedMinutes: 0,
  }));

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedMinutes, 0);

  if (totalAllocated !== sessionMinutes && allocations.length > 0) {
    const diff = sessionMinutes - totalAllocated;
    // Give adjustment to highest priority context
    const sortedByPriority = [...workingAllocations].sort((a, b) => a.priority - b.priority);
    const highestPriorityId = sortedByPriority[0].contextId;
    const alloc = allocations.find(a => a.contextId === highestPriorityId);
    if (alloc) {
      alloc.allocatedMinutes += diff;
    }
  }

  return {
    allocations,
    totalAllocated: allocations.reduce((sum, a) => sum + a.allocatedMinutes, 0),
    warnings,
    isValid: true,
  };
}

/**
 * Parse duration input (supports various formats)
 * - "1:30" → 90 minutes (h:mm format)
 * - "90min" or "90m" → 90 minutes (explicit minutes)
 * - "2h" → 120 minutes (explicit hours)
 * - "2" → 120 minutes (bare number defaults to hours)
 * Returns minutes or null if invalid
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) return null;

  // Try h:mm format
  if (trimmed.includes(':')) {
    const [hoursStr, minutesStr] = trimmed.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes >= 60) {
      return null;
    }

    return hours * 60 + minutes;
  }

  // Try explicit minutes suffix (e.g., "90min", "90m")
  const minMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:min|m)$/);
  if (minMatch) {
    const minutes = parseFloat(minMatch[1]);
    if (isNaN(minutes) || minutes <= 0) {
      return null;
    }
    return Math.round(minutes);
  }

  // Try explicit hours suffix (e.g., "2h", "1.5h")
  const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    if (isNaN(hours) || hours <= 0) {
      return null;
    }
    return Math.round(hours * 60);
  }

  // Bare number defaults to hours
  const hours = parseFloat(trimmed);

  if (isNaN(hours) || hours <= 0) {
    return null;
  }

  return Math.round(hours * 60);
}

/**
 * Format duration as "Xh Ym" string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Validate session duration is within acceptable range
 */
export function validateDuration(minutes: number): { valid: boolean; error?: string } {
  if (minutes < 1) {
    return { valid: false, error: 'Duration must be at least 1 minute' };
  }

  if (minutes > 720) {
    return { valid: false, error: 'Duration cannot exceed 12 hours (720 minutes)' };
  }

  return { valid: true };
}
