'use client';

import { type ReactNode, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { Task } from '@/lib/types';
import { SortableTaskItem } from './SortableTaskItem';
import { EmptyState } from '../shared/EmptyState';
import { CheckSquare } from 'lucide-react';
import { calculateNewPosition } from '@/lib/position';
import { getChildren, getChildCompletionStats, hasChildren as checkHasChildren } from '@/lib/taskHierarchy';

export interface SortableTaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateDescription?: (taskId: string, description: string) => void;
  onAddSubtask?: (parentId: string) => void;
  onReorder: (taskId: string, newPosition: string) => void;
  onMoveToParent?: (taskId: string, newParentId: string | null) => void;
  // Hierarchy props
  expandedTaskIds?: string[];
  onToggleExpand?: (taskId: string) => void;
  onFocus?: (taskId: string) => void;
}

export function SortableTaskList({
  tasks,
  emptyMessage = 'No tasks yet',
  emptyDescription,
  emptyAction,
  onEditTask,
  onDeleteTask,
  onUpdateDescription,
  onAddSubtask,
  onReorder,
  onMoveToParent,
  expandedTaskIds = [],
  onToggleExpand,
  onFocus,
}: SortableTaskListProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

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

    onReorder(active.id as string, newPosition);
  };

  // Get only root-level tasks (tasks with no parent)
  const rootTasks = tasks.filter((t) => t.parentId === null);

  if (rootTasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare />}
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
        size="sm"
      />
    );
  }

  // Recursive component to render task and its children
  const renderTaskWithChildren = (task: Task, depth: number): React.ReactNode => {
    const hasChildTasks = checkHasChildren(tasks, task.id);
    const isExpanded = expandedTaskIds.includes(task.id);
    const childStats = hasChildTasks
      ? getChildCompletionStats(tasks, task.id)
      : undefined;

    return (
      <div key={task.id}>
        <SortableTaskItem
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdateDescription={onUpdateDescription}
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
          <div className="space-y-0.5">
            {getChildren(tasks, task.id).map((child) =>
              renderTaskWithChildren(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
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
        <div className="space-y-0.5">
          {rootTasks.map((task) => renderTaskWithChildren(task, 0))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
