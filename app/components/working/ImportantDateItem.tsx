'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CountdownBadge } from '@/app/components/shared/CountdownBadge';
import { getContextColor, type ContextColorName } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface ImportantDateItemProps {
  dateId: string;
  label: string;
  date: string;
  contextId: string;
  contextName: string;
  contextColor: ContextColorName;
  showContextBadge?: boolean;
  onDelete: (contextId: string, dateId: string) => void;
}

export function ImportantDateItem({
  dateId,
  label,
  date,
  contextId,
  contextName,
  contextColor,
  showContextBadge = false,
  onDelete,
}: ImportantDateItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const colors = getContextColor(contextColor);

  const handleDelete = () => {
    onDelete(contextId, dateId);
    setShowDeleteDialog(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 p-3 border rounded-md bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{label}</span>
          {showContextBadge && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md',
                'bg-muted text-muted-foreground'
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: colors.dotColor }}
              />
              <span className="truncate max-w-[100px]">{contextName}</span>
            </span>
          )}
        </div>
        <div className="mt-1">
          <CountdownBadge date={date} showIcon />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${label}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Important Date</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{label}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
