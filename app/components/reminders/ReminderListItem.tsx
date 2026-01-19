'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Pencil, Trash2, Clock, Timer, Moon, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { formatReminderSchedule, getNextTriggerTime, formatTimeUntilTrigger } from '@/lib/reminders';
import type { Reminder } from '@/lib/types';

interface ReminderListItemProps {
  reminder: Reminder;
  onEdit: () => void;
}

export function ReminderListItem({ reminder, onEdit }: ReminderListItemProps) {
  const { state, toggleReminderEnabled, deleteReminder } = useStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isSessionActive = state.session?.status === 'active';
  const nextTrigger = reminder.enabled ? getNextTriggerTime(reminder) : null;
  const timeUntil = formatTimeUntilTrigger(nextTrigger);
  const scheduleText = formatReminderSchedule(reminder.config);

  // Only show next trigger time for session-only reminders when session is active
  const shouldShowNextTrigger = reminder.enabled && nextTrigger &&
    (reminder.scope === 'always' || (reminder.scope === 'session-only' && isSessionActive));

  const getTypeIcon = () => {
    switch (reminder.config.type) {
      case 'interval':
        return <Timer className="size-4" />;
      case 'fixed-time':
        return <CalendarClock className="size-4" />;
      case 'prayer':
        return <Moon className="size-4" />;
    }
  };

  const handleDelete = () => {
    deleteReminder(reminder.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className={`rounded-lg border p-4 transition-colors ${
          reminder.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{reminder.title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {scheduleText}
              </p>
              {shouldShowNextTrigger && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="size-3" />
                  Next: {timeUntil}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={reminder.enabled}
              onCheckedChange={() => toggleReminderEnabled(reminder.id)}
              aria-label={reminder.enabled ? 'Disable reminder' : 'Enable reminder'}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{reminder.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
