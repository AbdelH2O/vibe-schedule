'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import { SortableTaskList } from './SortableTaskList';
import { TaskBreadcrumb } from './TaskBreadcrumb';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, Plus } from 'lucide-react';
import { getDescendants } from '@/lib/taskHierarchy';

export function InboxView() {
  const { getInboxTasks, updateTask, reorderTask, state, toggleTaskExpanded, addSubtask, moveTaskToParent } = useStore();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const inboxTasks = getInboxTasks();
  const isDefinitionMode = state.mode === 'definition';
  const { expandedTaskIds } = state;

  // Filter tasks based on focus
  const visibleTasks = focusedTaskId
    ? [
        ...inboxTasks.filter((t) => t.id === focusedTaskId),
        ...getDescendants(inboxTasks, focusedTaskId),
      ]
    : inboxTasks;

  const handleUpdateDescription = (taskId: string, description: string) => {
    updateTask(taskId, { description: description || undefined });
  };

  const handleAddSubtask = (parentId: string) => {
    addSubtask(parentId, 'New subtask');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Inbox className="size-5 text-muted-foreground" aria-hidden="true" />
          <CardTitle>Inbox</CardTitle>
        </div>
        {isDefinitionMode && (
          <Button size="sm" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="size-4 mr-1" aria-hidden="true" />
            Add Task
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Breadcrumb navigation - show when focused on a task */}
        {focusedTaskId && (
          <div className="mb-4 pb-3 border-b border-border/50">
            <TaskBreadcrumb
              tasks={inboxTasks}
              focusedTaskId={focusedTaskId}
              rootLabel="Inbox"
              onNavigate={setFocusedTaskId}
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-4">
          {inboxTasks.length} unassigned {inboxTasks.length === 1 ? 'task' : 'tasks'}
        </p>
        <SortableTaskList
          tasks={visibleTasks}
          emptyMessage="Inbox is empty"
          emptyDescription="Tasks without a context will appear here. Assign them to contexts during work sessions."
          emptyAction={
            isDefinitionMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                <Plus className="size-4 mr-1" aria-hidden="true" />
                Add Task
              </Button>
            ) : undefined
          }
          onEditTask={isDefinitionMode ? setEditingTask : undefined}
          onUpdateDescription={isDefinitionMode ? handleUpdateDescription : undefined}
          onAddSubtask={isDefinitionMode ? handleAddSubtask : undefined}
          onReorder={reorderTask}
          onMoveToParent={isDefinitionMode ? moveTaskToParent : undefined}
          expandedTaskIds={expandedTaskIds}
          onToggleExpand={toggleTaskExpanded}
          onFocus={setFocusedTaskId}
        />
      </CardContent>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        contextId={null}
      />

      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </Card>
  );
}
