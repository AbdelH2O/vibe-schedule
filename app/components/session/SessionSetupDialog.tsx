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
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStore } from '@/lib/store';
import { calculateAllocations } from '@/lib/allocation';
import { SessionDurationInput } from './SessionDurationInput';
import { AllocationPreview } from './AllocationPreview';
import { OverCommitWarning } from './OverCommitWarning';
import { NoContextsMessage } from './NoContextsMessage';
import { Bookmark } from 'lucide-react';

interface SessionSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionSetupDialog({ open, onOpenChange }: SessionSetupDialogProps) {
  const { state, startSession, addPreset } = useStore();
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [savePopoverOpen, setSavePopoverOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

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
    setPresetName('');
  }, [allocationResult, sessionMinutes, startSession, onOpenChange, state.contexts]);

  const handleSavePreset = useCallback(() => {
    if (!allocationResult || !sessionMinutes || !presetName.trim()) return;

    // Sort allocations by context priority
    const sortedAllocations = [...allocationResult.allocations].sort((a, b) => {
      const ctxA = state.contexts.find((c) => c.id === a.contextId);
      const ctxB = state.contexts.find((c) => c.id === b.contextId);
      return (ctxA?.priority ?? 5) - (ctxB?.priority ?? 5);
    });

    addPreset({
      name: presetName.trim(),
      totalDuration: sessionMinutes,
      allocations: sortedAllocations,
    });

    setSavePopoverOpen(false);
    setPresetName('');
  }, [allocationResult, sessionMinutes, presetName, addPreset, state.contexts]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
    // Reset state
    setSessionMinutes(null);
    setPresetName('');
    setSavePopoverOpen(false);
  }, [onOpenChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canStart && !savePopoverOpen) {
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

  // Can save preset if we can start and have a name
  const canSavePreset = canStart && presetName.trim().length > 0;

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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>

            {/* Save as Preset */}
            {canStart && (
              <Popover open={savePopoverOpen} onOpenChange={setSavePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Bookmark className="size-4" />
                    Save as Preset
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Save Session Preset</h4>
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && canSavePreset) {
                          e.preventDefault();
                          handleSavePreset();
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSavePopoverOpen(false);
                          setPresetName('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSavePreset}
                        disabled={!canSavePreset}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

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
