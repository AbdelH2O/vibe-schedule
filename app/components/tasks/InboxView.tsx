'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import { TaskList } from './TaskList';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, Plus } from 'lucide-react';

export function InboxView() {
  const { getInboxTasks, updateTask, state } = useStore();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const inboxTasks = getInboxTasks();
  const isDefinitionMode = state.mode === 'definition';

  const handleUpdateDescription = (taskId: string, description: string) => {
    updateTask(taskId, { description: description || undefined });
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
        <p className="text-sm text-muted-foreground mb-4">
          {inboxTasks.length} unassigned {inboxTasks.length === 1 ? 'task' : 'tasks'}
        </p>
        <TaskList
          tasks={inboxTasks}
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
