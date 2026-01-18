'use client';

import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ModeIndicator() {
  const { state } = useStore();
  const isDefinition = state.mode === 'definition';

  // Use mode as key to trigger CSS animation on each mode change
  return (
    <Badge
      key={state.mode}
      variant="outline"
      className={cn(
        'gap-2 px-3 py-1.5 transition-all duration-300 animate-fade-in',
        isDefinition
          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300'
      )}
      role="status"
      aria-live="polite"
      aria-label={`Current mode: ${isDefinition ? 'Definition' : 'Working'}`}
    >
      <span
        className={cn(
          'size-2 rounded-full transition-colors duration-300',
          isDefinition
            ? 'bg-blue-500 dark:bg-blue-400'
            : 'bg-green-500 dark:bg-green-400 animate-pulse'
        )}
        aria-hidden="true"
      />
      <span>{isDefinition ? 'Definition' : 'Working'}</span>
    </Badge>
  );
}
