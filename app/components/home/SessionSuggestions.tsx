'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { calculateAllocations } from '@/lib/allocation';
import { Target, Scale, Clock, Settings, X } from 'lucide-react';
import type { SessionPreset } from '@/lib/types';

// Hook to detect Mac vs Windows/Linux for keyboard shortcut display
function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes('MAC'));
  }, []);
  return isMac;
}

interface SessionSuggestionsProps {
  onOpenCustomDialog: () => void;
}

export function SessionSuggestions({ onOpenCustomDialog }: SessionSuggestionsProps) {
  const { state, startSession, getTasksByContextId, getPresets, deletePreset } = useStore();
  const { contexts } = state;
  const presets = getPresets();
  const isMac = useIsMac();

  // Find the highest priority context with incomplete tasks
  const topContext = useMemo(() => {
    const contextsWithTasks = contexts
      .filter(c => getTasksByContextId(c.id).some(t => !t.completed))
      .sort((a, b) => a.priority - b.priority);
    return contextsWithTasks[0] || null;
  }, [contexts, getTasksByContextId]);

  // Calculate balanced allocations for 60 minutes
  const balancedAllocations = useMemo(() => {
    if (contexts.length === 0) return null;

    const result = calculateAllocations({
      contexts: contexts.map(ctx => ({
        id: ctx.id,
        priority: ctx.priority,
        minDuration: ctx.minDuration,
        maxDuration: ctx.maxDuration,
        weight: ctx.weight,
      })),
      sessionMinutes: 60,
    });

    if (!result.isValid) return null;

    // Sort by priority for session start
    return [...result.allocations].sort((a, b) => {
      const ctxA = contexts.find(c => c.id === a.contextId);
      const ctxB = contexts.find(c => c.id === b.contextId);
      return (ctxA?.priority ?? 5) - (ctxB?.priority ?? 5);
    });
  }, [contexts]);

  const handleQuickFocus = useCallback(() => {
    if (!topContext) return;

    startSession(25, [{
      contextId: topContext.id,
      allocatedMinutes: 25,
      usedMinutes: 0,
      adjustedMinutes: 0,
    }]);
  }, [topContext, startSession]);

  const handleBalanced = useCallback(() => {
    if (!balancedAllocations) return;
    startSession(60, balancedAllocations);
  }, [balancedAllocations, startSession]);

  const handleStartPreset = useCallback((preset: SessionPreset) => {
    // Filter allocations to only include contexts that still exist
    const validAllocations = preset.allocations.filter(alloc =>
      contexts.some(ctx => ctx.id === alloc.contextId)
    );

    if (validAllocations.length === 0) return;

    // Recalculate total duration based on valid allocations
    const totalMinutes = validAllocations.reduce((sum, a) => sum + a.allocatedMinutes, 0);

    startSession(totalMinutes, validAllocations.map(a => ({
      ...a,
      usedMinutes: 0,
      adjustedMinutes: 0,  // Reset adjustments when loading preset
    })));
  }, [contexts, startSession]);

  const handleDeletePreset = useCallback((e: React.MouseEvent, presetId: string) => {
    e.stopPropagation();
    deletePreset(presetId);
  }, [deletePreset]);

  // Don't show if no contexts
  if (contexts.length === 0) {
    return null;
  }

  const canQuickFocus = topContext !== null;
  const canBalanced = balancedAllocations !== null && balancedAllocations.length > 0;

  // Check if preset is valid (all contexts still exist)
  const isPresetValid = (preset: SessionPreset) =>
    preset.allocations.some(alloc => contexts.some(ctx => ctx.id === alloc.contextId));

  return (
    <section aria-labelledby="session-heading" className="space-y-4">
      <h2 id="session-heading" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Start a Session
      </h2>

      {/* Primary Custom Session Button */}
      <Button
        onClick={onOpenCustomDialog}
        className="w-full h-auto py-4 px-5"
        size="lg"
      >
        <Settings className="size-5 mr-3" aria-hidden="true" />
        <div className="flex flex-col items-start text-left flex-1">
          <span className="font-semibold">Start Custom Session</span>
          <span className="text-xs opacity-80">Configure duration & allocation</span>
        </div>
        <kbd className="ml-3 px-2 py-1 rounded bg-primary-foreground/20 text-xs font-mono">
          {isMac ? '⌘S' : 'Ctrl+S'}
        </kbd>
      </Button>

      {/* Quick Start Presets */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick Start
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Quick Focus Preset */}
          <Button
            variant="outline"
            className="h-auto py-3 px-3 flex-col items-start gap-1"
            onClick={handleQuickFocus}
            disabled={!canQuickFocus}
          >
            <div className="flex items-center gap-2 w-full">
              <Target className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span className="font-medium text-sm truncate">Quick Focus</span>
            </div>
            <span className="text-xs text-muted-foreground">25 min</span>
          </Button>

          {/* Balanced Preset */}
          <Button
            variant="outline"
            className="h-auto py-3 px-3 flex-col items-start gap-1"
            onClick={handleBalanced}
            disabled={!canBalanced}
          >
            <div className="flex items-center gap-2 w-full">
              <Scale className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span className="font-medium text-sm truncate">Balanced</span>
            </div>
            <span className="text-xs text-muted-foreground">60 min</span>
          </Button>

          {/* User-created Presets */}
          {presets.filter(isPresetValid).map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              className="h-auto py-3 px-3 flex-col items-start gap-1 relative group"
              onClick={() => handleStartPreset(preset)}
            >
              <div className="flex items-center gap-2 w-full">
                <Clock className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-sm truncate">{preset.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{preset.totalDuration} min</span>

              {/* Delete button */}
              <button
                onClick={(e) => handleDeletePreset(e, preset.id)}
                className="absolute top-1 right-1 p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                aria-label={`Delete ${preset.name} preset`}
              >
                <X className="size-3" />
              </button>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
