'use client';

import { useStore } from '@/lib/store';
import { ReminderListItem } from './ReminderListItem';
import { Bell } from 'lucide-react';
import type { Reminder } from '@/lib/types';

interface ReminderListProps {
  onEdit: (reminder: Reminder) => void;
}

export function ReminderList({ onEdit }: ReminderListProps) {
  const { getReminders } = useStore();
  const reminders = getReminders();

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Bell className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium">No reminders yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">
          Create a custom reminder or browse templates to get started
        </p>
      </div>
    );
  }

  // Sort reminders: enabled first, then by title
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-2">
      {sortedReminders.map((reminder) => (
        <ReminderListItem
          key={reminder.id}
          reminder={reminder}
          onEdit={() => onEdit(reminder)}
        />
      ))}
    </div>
  );
}
