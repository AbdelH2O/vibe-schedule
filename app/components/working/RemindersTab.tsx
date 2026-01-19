'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReminderListItem } from '@/app/components/reminders/ReminderListItem';
import { ReminderForm } from '@/app/components/reminders/ReminderForm';
import type { Reminder } from '@/lib/types';

interface RemindersTabProps {
  reminders: Reminder[];
  onDeleteReminder: (id: string) => void;
}

export function RemindersTab({ reminders, onDeleteReminder }: RemindersTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>(undefined);

  const handleAdd = () => {
    setEditingReminder(undefined);
    setShowForm(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingReminder(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReminder(undefined);
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <ReminderForm
          reminder={editingReminder}
          onComplete={handleFormComplete}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">All Reminders</h3>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleAdd}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {/* Reminder list */}
      {reminders.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No reminders configured.</p>
          <Button variant="link" size="sm" className="mt-2" onClick={handleAdd}>
            Add one now
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <ReminderListItem
              key={reminder.id}
              reminder={reminder}
              onEdit={() => handleEdit(reminder)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
