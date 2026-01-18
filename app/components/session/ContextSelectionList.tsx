'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { formatDuration, type AllocationResult } from '@/lib/allocation';
import { ContextSelectionCard } from './ContextSelectionCard';
import { cn } from '@/lib/utils';

interface ContextSelectionListProps {
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  allocationResult: AllocationResult | null;
  sessionMinutes: number;
  className?: string;
}

export function ContextSelectionList({
  selectedIds,
  onSelectionChange,
  allocationResult,
  sessionMinutes,
  className,
}: ContextSelectionListProps) {
  const { state } = useStore();
  const contexts = state.contexts;

  const handleSelectAll = useCallback(() => {
    onSelectionChange(new Set(contexts.map(c => c.id)));
  }, [contexts, onSelectionChange]);

  const handleRemoveAll = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  const handleToggle = useCallback((contextId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(contextId)) {
      newSelected.delete(contextId);
    } else {
      newSelected.add(contextId);
    }
    onSelectionChange(newSelected);
  }, [selectedIds, onSelectionChange]);


  if (contexts.length === 0) {
    return null;
  }

  const selectedCount = selectedIds.size;
  const totalCount = contexts.length;
  const allSelected = selectedCount === totalCount;
  const noneSelected = selectedCount === 0;

  // Get allocation for a context
  const getAllocation = (contextId: string) => {
    return allocationResult?.allocations.find(a => a.contextId === contextId);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with count and bulk actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Contexts ({selectedCount} of {totalCount})
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={allSelected}
            className="h-7 px-2 text-xs"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveAll}
            disabled={noneSelected}
            className="h-7 px-2 text-xs"
          >
            Remove All
          </Button>
        </div>
      </div>

      {/* Context list */}
      <div
        role="listbox"
        aria-multiselectable="true"
        aria-label="Select contexts to include in session"
        className="space-y-2 max-h-[280px] overflow-y-auto pr-1"
      >
        {contexts.map((context) => (
          <ContextSelectionCard
            key={context.id}
            context={context}
            selected={selectedIds.has(context.id)}
            onToggle={() => handleToggle(context.id)}
            allocation={getAllocation(context.id)}
            sessionMinutes={sessionMinutes}
          />
        ))}
      </div>

      {/* Total validation */}
      {allocationResult && selectedCount > 0 && (
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span
            className={cn(
              'font-mono font-medium',
              allocationResult.totalAllocated === sessionMinutes
                ? 'text-foreground'
                : 'text-destructive'
            )}
          >
            {formatDuration(allocationResult.totalAllocated)}
            {allocationResult.totalAllocated !== sessionMinutes && (
              <span className="text-destructive ml-2">
                (should be {formatDuration(sessionMinutes)})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Empty state message */}
      {noneSelected && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Select at least one context to start a session
        </p>
      )}
    </div>
  );
}
