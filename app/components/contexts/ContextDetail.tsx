'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TaskList } from '../tasks/TaskList';
import { EditTaskDialog } from '../tasks/EditTaskDialog';
import { EmptyState } from '../shared/EmptyState';
import { ContextDetailHeader } from './ContextDetailHeader';
import { QuickAddTask } from './QuickAddTask';
import { ContextSettingsSheet } from './ContextSettingsSheet';
import { ImportantDateList } from './ImportantDateList';
import { useStore } from '@/lib/store';
import { ChevronDown, ChevronRight, CheckSquare, Plus } from 'lucide-react';
import type { Context, Task } from '@/lib/types';

interface ContextDetailProps {
  context: Context;
  onDeleted?: () => void;
}

export function ContextDetail({ context, onDeleted }: ContextDetailProps) {
  const { deleteContext, getTasksByContextId, state } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const contextTasks = getTasksByContextId(context.id);
  const isDefinitionMode = state.mode === 'definition';

  // Separate active and completed tasks
  const activeTasks = contextTasks.filter((t) => !t.completed);
  const completedTasks = contextTasks.filter((t) => t.completed);

  const handleDelete = () => {
    deleteContext(context.id);
    onDeleted?.();
  };

  const importantDates = context.importantDates ?? [];

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden">
        {/* Compact header with stats */}
        <ContextDetailHeader
          context={context}
          tasks={contextTasks}
          isDefinitionMode={isDefinitionMode}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onDeleteClick={() => setShowDeleteConfirm(true)}
        />

        {/* Quick add task input - only in definition mode */}
        {isDefinitionMode && <QuickAddTask contextId={context.id} />}

        {/* Task list - primary content */}
        <div className="flex-1 overflow-y-auto" role="main" aria-label="Task list">
          {/* Important dates - shown when present */}
          {importantDates.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Important Dates
              </h2>
              <ImportantDateList dates={importantDates} className="space-y-1.5" />
            </div>
          )}
          {contextTasks.length === 0 ? (
            <div className={importantDates.length > 0 ? 'px-4 pb-4' : 'p-4'}>
              <EmptyState
                icon={<CheckSquare />}
                title="No tasks yet"
                description="Add your first task to get started. Break down your work into actionable items."
                action={
                  isDefinitionMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Focus the quick add input
                        const input = document.querySelector<HTMLInputElement>(
                          'input[aria-label="Add new task"]'
                        );
                        input?.focus();
                      }}
                    >
                      <Plus className="size-4 mr-1" aria-hidden="true" />
                      Add Task
                    </Button>
                  ) : undefined
                }
                size="md"
              />
            </div>
          ) : (
            <div className={importantDates.length > 0 ? 'px-4 pb-4 space-y-4' : 'p-4 space-y-4'}>
              {/* Active tasks */}
              {activeTasks.length > 0 && (
                <TaskList
                  tasks={activeTasks}
                  onEditTask={isDefinitionMode ? setEditingTask : undefined}
                />
              )}

              {/* Empty active state when all tasks completed */}
              {activeTasks.length === 0 && completedTasks.length > 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All tasks completed!</p>
                </div>
              )}

              {/* Completed tasks toggle */}
              {completedTasks.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    aria-expanded={showCompleted}
                    aria-controls="completed-tasks"
                  >
                    {showCompleted ? (
                      <ChevronDown className="size-4" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="size-4" aria-hidden="true" />
                    )}
                    <span>
                      {showCompleted ? 'Hide' : 'Show'} completed ({completedTasks.length})
                    </span>
                  </button>

                  {showCompleted && (
                    <div id="completed-tasks" className="mt-3">
                      <TaskList
                        tasks={completedTasks}
                        onEditTask={isDefinitionMode ? setEditingTask : undefined}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Settings sheet */}
      <ContextSettingsSheet
        context={context}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${context.name}"?`}
        description="This action cannot be undone. Tasks assigned to this context will be moved to the Inbox."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Edit task dialog */}
      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </>
  );
}
