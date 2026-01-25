'use client';

import { forwardRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useStore } from '@/lib/store';
import type { ContextColorName } from '@/lib/colors';
import type { Task } from '@/lib/types';
import { SortableWorkingTaskItem } from './SortableWorkingTaskItem';
import { WorkingQuickAdd, type WorkingQuickAddRef } from './WorkingQuickAdd';
import { UrgentTasksBanner } from './UrgentTasksBanner';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateNewPosition } from '@/lib/position';
import { getChildren, getChildCompletionStats, hasChildren as checkHasChildren } from '@/lib/taskHierarchy';

interface WorkingTaskListProps {
  contextId: string;
  contextColor?: ContextColorName;
  expandedTaskIds?: string[];
  onToggleExpand?: (taskId: string) => void;
  onFocus?: (taskId: string) => void;
  onAddSubtask?: (parentId: string) => void;
  onMoveToParent?: (taskId: string, newParentId: string | null) => void;
}

export const WorkingTaskList = forwardRef<WorkingQuickAddRef, WorkingTaskListProps>(
  function WorkingTaskList({ contextId, contextColor, expandedTaskIds = [], onToggleExpand, onFocus, onAddSubtask, onMoveToParent }, ref) {
    const { getTasksByContextId, toggleTaskCompleted, updateTask, deleteTask, reorderTask } = useStore();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const tasks = getTasksByContextId(contextId);
    const completedCount = tasks.filter((t) => t.completed).length;
    const totalCount = tasks.length;

    // Get only root-level tasks (tasks with no parent)
    const rootTasks = tasks.filter((t) => t.parentId === null);

    // Recursive component to render task and its children
    const renderTaskWithChildren = (task: Task, depth: number): React.ReactNode => {
      const hasChildTasks = checkHasChildren(tasks, task.id);
      const isExpanded = expandedTaskIds.includes(task.id);
      const childStats = hasChildTasks
        ? getChildCompletionStats(tasks, task.id)
        : undefined;

      return (
        <li key={task.id}>
          <SortableWorkingTaskItem
            task={task}
            contextColor={contextColor}
            onToggleCompleted={toggleTaskCompleted}
            onUpdateDescription={(description) =>
              updateTask(task.id, { description })
            }
            onDelete={deleteTask}
            onAddSubtask={onAddSubtask}
            depth={depth}
            isExpanded={isExpanded}
            hasChildren={hasChildTasks}
            childStats={childStats}
            onToggleExpand={onToggleExpand ? () => onToggleExpand(task.id) : undefined}
            onFocus={onFocus}
            activeTaskId={activeTaskId}
          />
          {/* Render children when expanded */}
          {hasChildTasks && isExpanded && (
            <ul className="space-y-2 mt-2">
              {getChildren(tasks, task.id).map((child) =>
                renderTaskWithChildren(child, depth + 1)
              )}
            </ul>
          )}
        </li>
      );
    };

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragStart = (event: DragStartEvent) => {
      setActiveTaskId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTaskId(null);

      if (!over) return;

      // Check if dropping on a "make-child" zone
      const overData = over.data?.current;
      if (overData?.type === 'make-child' && onMoveToParent) {
        const targetParentId = overData.targetTaskId as string;
        // Don't allow dropping on self
        if (targetParentId !== active.id) {
          onMoveToParent(active.id as string, targetParentId);
          return;
        }
      }

      // Regular reorder logic
      if (active.id === over.id) return;

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
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3" role="list">
                {rootTasks.map((task) => renderTaskWithChildren(task, 0))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    );
  }
);
