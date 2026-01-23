'use client';

import { type ReactNode } from 'react';
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
import { Task } from '@/lib/types';
import { SortableTaskItem } from './SortableTaskItem';
import { EmptyState } from '../shared/EmptyState';
import { CheckSquare } from 'lucide-react';
import { calculateNewPosition } from '@/lib/position';

export interface SortableTaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateDescription?: (taskId: string, description: string) => void;
  onReorder: (taskId: string, newPosition: string) => void;
}

export function SortableTaskList({
  tasks,
  emptyMessage = 'No tasks yet',
  emptyDescription,
  emptyAction,
  onEditTask,
  onDeleteTask,
  onUpdateDescription,
  onReorder,
}: SortableTaskListProps) {
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

    onReorder(active.id as string, newPosition);
  };

  if (tasks.length === 0) {
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

  return (
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
        <div className="space-y-1">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onUpdateDescription={onUpdateDescription}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
