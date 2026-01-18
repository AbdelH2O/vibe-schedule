'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Target } from 'lucide-react';
import type { Session, Context, Task } from '@/lib/types';

export interface SessionSummaryData {
  totalDurationMinutes: number;
  totalUsedMinutes: number;
  contextBreakdown: Array<{
    contextId: string;
    contextName: string;
    allocatedMinutes: number;
    usedMinutes: number;
    tasksCompleted: number;
    totalTasks: number;
  }>;
  totalTasksCompleted: number;
  totalTasks: number;
}

interface SessionSummaryProps {
  open: boolean;
  onDismiss: () => void;
  summaryData: SessionSummaryData | null;
}

function formatDuration(minutes: number): string {
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = Math.floor(absMinutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function SessionSummary({
  open,
  onDismiss,
  summaryData,
}: SessionSummaryProps) {
  if (!summaryData) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-500" aria-hidden="true" />
            Session Complete
          </DialogTitle>
          <DialogDescription>
            Here&apos;s a summary of your work session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Time Used</p>
                <p className="font-semibold">
                  {formatDuration(summaryData.totalUsedMinutes)} / {formatDuration(summaryData.totalDurationMinutes)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Target className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="font-semibold">
                  {summaryData.totalTasksCompleted} / {summaryData.totalTasks}
                </p>
              </div>
            </div>
          </div>

          {/* Context Breakdown */}
          {summaryData.contextBreakdown.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">By Context</h4>
              <div className="space-y-2">
                {summaryData.contextBreakdown.map((ctx) => {
                  const timePercent = ctx.allocatedMinutes > 0
                    ? Math.min(100, Math.round((ctx.usedMinutes / ctx.allocatedMinutes) * 100))
                    : 0;
                  const isOvertime = ctx.usedMinutes > ctx.allocatedMinutes;

                  return (
                    <div
                      key={ctx.contextId}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{ctx.contextName}</span>
                        <span className="text-sm text-muted-foreground">
                          {ctx.tasksCompleted}/{ctx.totalTasks} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOvertime ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(100, timePercent)}%` }}
                          />
                        </div>
                        <span className={`text-xs tabular-nums ${isOvertime ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {formatDuration(ctx.usedMinutes)}/{formatDuration(ctx.allocatedMinutes)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onDismiss} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Calculates summary data from the current session state.
 * Call this BEFORE ending the session to capture the final state.
 */
export function calculateSessionSummary(
  session: Session,
  contexts: Context[],
  tasks: Task[],
  currentContextElapsedMinutes: number
): SessionSummaryData {
  // Update the active context's used time with current elapsed
  const finalAllocations = session.allocations.map((alloc) => {
    if (alloc.contextId === session.activeContextId) {
      return { ...alloc, usedMinutes: alloc.usedMinutes + currentContextElapsedMinutes };
    }
    return alloc;
  });

  const contextBreakdown = finalAllocations.map((alloc) => {
    const context = contexts.find((c) => c.id === alloc.contextId);
    const contextTasks = tasks.filter((t) => t.contextId === alloc.contextId);
    const completedTasks = contextTasks.filter((t) => t.completed);

    return {
      contextId: alloc.contextId,
      contextName: context?.name ?? 'Unknown',
      allocatedMinutes: alloc.allocatedMinutes,
      usedMinutes: alloc.usedMinutes,
      tasksCompleted: completedTasks.length,
      totalTasks: contextTasks.length,
    };
  });

  const totalUsedMinutes = finalAllocations.reduce((sum, a) => sum + a.usedMinutes, 0);
  const totalTasksCompleted = contextBreakdown.reduce((sum, c) => sum + c.tasksCompleted, 0);
  const totalTasks = contextBreakdown.reduce((sum, c) => sum + c.totalTasks, 0);

  return {
    totalDurationMinutes: session.totalDuration,
    totalUsedMinutes,
    contextBreakdown,
    totalTasksCompleted,
    totalTasks,
  };
}
