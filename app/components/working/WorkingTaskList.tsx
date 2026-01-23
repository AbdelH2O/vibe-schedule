'use client';

import { forwardRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useStore } from '@/lib/store';
import type { ContextColorName } from '@/lib/colors';
import { SortableWorkingTaskItem } from './SortableWorkingTaskItem';
import { WorkingQuickAdd, type WorkingQuickAddRef } from './WorkingQuickAdd';
import { UrgentTasksBanner } from './UrgentTasksBanner';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateNewPosition } from '@/lib/position';

interface WorkingTaskListProps {
  contextId: string;
  contextColor?: ContextColorName;
}

export const WorkingTaskList = forwardRef<WorkingQuickAddRef, WorkingTaskListProps>(
  function WorkingTaskList({ contextId, contextColor }, ref) {
    const { getTasksByContextId, toggleTaskCompleted, updateTask, deleteTask, reorderTask } = useStore();

    const tasks = getTasksByContextId(contextId);
    const completedCount = tasks.filter((t) => t.completed).length;
    const totalCount = tasks.length;

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const sortedItems = tasks.map((t) => ({ id: t.id, position: t.position }));
      const newPosition = calculateNewPosition(
        sortedItems,
        active.id as string,
        over.id as string
      );

      reorderTask(active.id as string, newPosition);
    };

    return (
      <div className={cn(
        'p-6 border rounded-lg',
        'bg-white'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Tasks</h3>
          {totalCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>

        {/* Urgent tasks banner */}
        <UrgentTasksBanner tasks={tasks} />

        {/* Quick add elevated to top */}
        <WorkingQuickAdd ref={ref} contextId={contextId} />

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="size-12 text-muted-foreground/50 mb-3" aria-hidden="true" />
            <p className="text-muted-foreground">
              No tasks in this context
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">n</kbd> to add a task
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3" role="list">
                {tasks.map((task) => (
                  <SortableWorkingTaskItem
                    key={task.id}
                    task={task}
                    contextColor={contextColor}
                    onToggleCompleted={toggleTaskCompleted}
                    onUpdateDescription={(description) =>
                      updateTask(task.id, { description })
                    }
                    onDelete={deleteTask}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    );
  }
);
