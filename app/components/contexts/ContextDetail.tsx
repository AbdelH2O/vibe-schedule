'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TaskList } from '../tasks/TaskList';
import { SortableTaskList } from '../tasks/SortableTaskList';
import { EditTaskDialog } from '../tasks/EditTaskDialog';
import { EmptyState } from '../shared/EmptyState';
import { ContextDetailHeader } from './ContextDetailHeader';
import { QuickAddTask } from './QuickAddTask';
import { ContextSettingsSheet } from './ContextSettingsSheet';
import { ImportantDateList } from './ImportantDateList';
import { ImportantDateForm } from './ImportantDateForm';
import { useStore } from '@/lib/store';
import { generateId } from '@/lib/storage';
import { ChevronDown, ChevronRight, CheckSquare, Plus, Flag } from 'lucide-react';
import type { Context, Task, ImportantDate } from '@/lib/types';

interface ContextDetailProps {
  context: Context;
  onDeleted?: () => void;
}

export function ContextDetail({ context, onDeleted }: ContextDetailProps) {
  const { deleteContext, getTasksByContextId, updateContext, updateTask, reorderTask, state } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

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

  const handleAddDate = (date: Omit<ImportantDate, 'id'>) => {
    const newDates = [...importantDates, { ...date, id: generateId() }];
    updateContext(context.id, { importantDates: newDates });
    setShowAddMilestone(false);
  };

  const handleRemoveDate = (id: string) => {
    const newDates = importantDates.filter((d) => d.id !== id);
    updateContext(context.id, {
      importantDates: newDates.length > 0 ? newDates : undefined,
    });
  };

  const handleUpdateDescription = (taskId: string, description: string) => {
    updateTask(taskId, { description: description || undefined });
  };

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
          {/* Milestones section - collapsible with inline management */}
          {(importantDates.length > 0 || isDefinitionMode) && (
            <div className="px-4 pt-3 pb-2 border-b border-border/50">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowMilestones(!showMilestones)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                  aria-expanded={showMilestones}
                  aria-controls="milestones-section"
                >
                  {showMilestones ? (
                    <ChevronDown className="size-3" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="size-3" aria-hidden="true" />
                  )}
                  <Flag className="size-3" aria-hidden="true" />
                  <span>Milestones{importantDates.length > 0 && ` (${importantDates.length})`}</span>
                </button>
                {isDefinitionMode && showMilestones && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => setShowAddMilestone(!showAddMilestone)}
                    aria-label={showAddMilestone ? 'Cancel adding milestone' : 'Add milestone'}
                  >
                    <Plus
                      className={`size-3.5 transition-transform ${showAddMilestone ? 'rotate-45' : ''}`}
                      aria-hidden="true"
                    />
                  </Button>
                )}
              </div>

              {showMilestones && (
                <div id="milestones-section" className="space-y-2">
                  {showAddMilestone && isDefinitionMode && (
                    <ImportantDateForm onAdd={handleAddDate} compact />
                  )}
                  {importantDates.length > 0 ? (
                    <ImportantDateList
                      dates={importantDates}
                      onRemove={isDefinitionMode ? handleRemoveDate : undefined}
                      compact
                    />
                  ) : (
                    !showAddMilestone && (
                      <p className="text-xs text-muted-foreground italic">
                        No milestones set
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          )}
          {contextTasks.length === 0 ? (
            <div className="p-4">
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
            <div className="p-4 space-y-4">
              {/* Active tasks */}
              {activeTasks.length > 0 && (
                <SortableTaskList
                  tasks={activeTasks}
                  onEditTask={isDefinitionMode ? setEditingTask : undefined}
                  onUpdateDescription={isDefinitionMode ? handleUpdateDescription : undefined}
                  onReorder={reorderTask}
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
                      <SortableTaskList
                        tasks={completedTasks}
                        onEditTask={isDefinitionMode ? setEditingTask : undefined}
                        onUpdateDescription={isDefinitionMode ? handleUpdateDescription : undefined}
                        onReorder={reorderTask}
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
