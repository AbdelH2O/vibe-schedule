'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ImportantDateList } from './ImportantDateList';
import { ContextForm } from './ContextForm';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useStore } from '@/lib/store';
import { Clock, Scale, Calendar, Pencil, Trash2 } from 'lucide-react';
import type { Context } from '@/lib/types';

interface ContextDetailProps {
  context: Context;
  onDeleted?: () => void;
}

// Priority labels for display
const priorityLabels: Record<number, string> = {
  1: 'Highest',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Lowest',
};

export function ContextDetail({ context, onDeleted }: ContextDetailProps) {
  const { deleteContext } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteContext(context.id);
    onDeleted?.();
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Context</CardTitle>
        </CardHeader>
        <CardContent>
          <ContextForm
            initialData={context}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{context.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  Priority {context.priority}: {priorityLabels[context.priority]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                aria-label="Edit context"
              >
                <Pencil className="size-4 mr-2" aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive"
                aria-label="Delete context"
              >
                <Trash2 className="size-4 mr-2" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Time Constraints */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="size-4" aria-hidden="true" />
              Time Constraints
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-md border bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Minimum Duration
                </p>
                <p className="text-lg font-semibold">
                  {context.minDuration ? `${context.minDuration} min` : '—'}
                </p>
              </div>
              <div className="p-3 rounded-md border bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Maximum Duration
                </p>
                <p className="text-lg font-semibold">
                  {context.maxDuration ? `${context.maxDuration} min` : '—'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Weight */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Scale className="size-4" aria-hidden="true" />
              Time Distribution
            </h3>
            <div className="p-3 rounded-md border bg-muted/50 inline-block">
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <p className="text-lg font-semibold">{context.weight}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Higher weights receive proportionally more time when distributing
              remaining session time.
            </p>
          </div>

          <Separator />

          {/* Important Dates */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar className="size-4" aria-hidden="true" />
              Important Dates
            </h3>
            <ImportantDateList dates={context.importantDates ?? []} />
          </div>

          <Separator />

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <p>
              Created:{' '}
              {new Date(context.createdAt).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              })}
            </p>
            <p>
              Last updated:{' '}
              {new Date(context.updatedAt).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${context.name}"?`}
        description="This action cannot be undone. Tasks assigned to this context will be moved to the Inbox."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
