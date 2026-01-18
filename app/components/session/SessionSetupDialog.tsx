'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { calculateAllocations } from '@/lib/allocation';
import { SessionDurationInput } from './SessionDurationInput';
import { AllocationPreview } from './AllocationPreview';
import { OverCommitWarning } from './OverCommitWarning';
import { NoContextsMessage } from './NoContextsMessage';

interface SessionSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionSetupDialog({ open, onOpenChange }: SessionSetupDialogProps) {
  const { state, startSession } = useStore();
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);

  // Calculate allocations when duration changes
  const allocationResult = useMemo(() => {
    if (sessionMinutes === null || sessionMinutes <= 0) {
      return null;
    }

    const contexts = state.contexts.map((ctx) => ({
      id: ctx.id,
      priority: ctx.priority,
      minDuration: ctx.minDuration,
      maxDuration: ctx.maxDuration,
      weight: ctx.weight,
    }));

    return calculateAllocations({
      contexts,
      sessionMinutes,
    });
  }, [sessionMinutes, state.contexts]);

  const handleStartSession = useCallback(() => {
    if (!allocationResult || !sessionMinutes) return;

    // Sort allocations by context priority (lowest number = highest priority)
    const sortedAllocations = [...allocationResult.allocations].sort((a, b) => {
      const ctxA = state.contexts.find((c) => c.id === a.contextId);
      const ctxB = state.contexts.find((c) => c.id === b.contextId);
      return (ctxA?.priority ?? 5) - (ctxB?.priority ?? 5);
    });

    startSession(sessionMinutes, sortedAllocations);
    onOpenChange(false);

    // Reset state for next time
    setSessionMinutes(null);
  }, [allocationResult, sessionMinutes, startSession, onOpenChange, state.contexts]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
    // Reset state
    setSessionMinutes(null);
  }, [onOpenChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canStart) {
      e.preventDefault();
      handleStartSession();
    }
  };

  // Check if we have no contexts
  const hasNoContexts = state.contexts.length === 0;

  // Check for warnings
  const overCommitWarning = allocationResult?.warnings.find(
    (w) => w.type === 'over_committed_minimums'
  );

  const handleExtendTime = useCallback((suggestedMinutes: number) => {
    setSessionMinutes(suggestedMinutes);
  }, []);

  // Can start if we have a valid result and duration
  const canStart =
    allocationResult !== null &&
    allocationResult.isValid &&
    sessionMinutes !== null &&
    sessionMinutes > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-describedby="session-setup-description"
      >
        <DialogHeader>
          <DialogTitle>Start Session</DialogTitle>
          <DialogDescription id="session-setup-description">
            Enter your available time to see how it will be distributed across contexts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {hasNoContexts ? (
            <NoContextsMessage onClose={handleCancel} />
          ) : (
            <>
              <SessionDurationInput
                value={sessionMinutes}
                onChange={setSessionMinutes}
              />

              {allocationResult && sessionMinutes && (
                <>
                  {overCommitWarning && (
                    <OverCommitWarning
                      warning={overCommitWarning}
                      onExtendTime={handleExtendTime}
                      onProceedAnyway={handleStartSession}
                    />
                  )}

                  <AllocationPreview
                    result={allocationResult}
                    sessionMinutes={sessionMinutes}
                  />
                </>
              )}
            </>
          )}
        </div>

        {!hasNoContexts && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={!canStart}
              aria-label="Start Session"
            >
              Start Session
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
