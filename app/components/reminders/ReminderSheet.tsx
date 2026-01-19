'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ReminderList } from './ReminderList';
import { ReminderForm } from './ReminderForm';
import { ReminderTemplates } from './ReminderTemplates';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import type { Reminder } from '@/lib/types';

type SheetView = 'list' | 'create' | 'edit' | 'templates';

interface ReminderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReminderSheet({ open, onOpenChange }: ReminderSheetProps) {
  const [view, setView] = useState<SheetView>('list');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { state, setNotificationPermission } = useStore();

  const handleCreateNew = () => {
    setEditingReminder(null);
    setView('create');
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setView('edit');
  };

  const handleFormComplete = () => {
    setEditingReminder(null);
    setView('list');
  };

  const handleTemplateSelect = () => {
    setView('list');
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    if (result !== 'unsupported') {
      setNotificationPermission(result);
    }
  };

  const currentPermission = getNotificationPermission();
  const showPermissionBanner = currentPermission === 'default' || currentPermission === 'denied';

  const renderContent = () => {
    switch (view) {
      case 'create':
        return (
          <ReminderForm
            onComplete={handleFormComplete}
            onCancel={() => setView('list')}
          />
        );
      case 'edit':
        return (
          <ReminderForm
            reminder={editingReminder ?? undefined}
            onComplete={handleFormComplete}
            onCancel={() => setView('list')}
          />
        );
      case 'templates':
        return (
          <ReminderTemplates
            onSelect={handleTemplateSelect}
            onBack={() => setView('list')}
          />
        );
      case 'list':
      default:
        return (
          <div className="flex flex-col h-full">
            {/* Permission banner */}
            {showPermissionBanner && (
              <div className="mb-4 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  {currentPermission === 'denied' ? (
                    <BellOff className="size-5 text-muted-foreground mt-0.5" />
                  ) : (
                    <Bell className="size-5 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {currentPermission === 'denied'
                        ? 'Notifications blocked'
                        : 'Enable notifications'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentPermission === 'denied'
                        ? 'Notifications are blocked. You can enable them in browser settings.'
                        : 'Get notified about reminders even when the tab is in the background.'}
                    </p>
                    {currentPermission !== 'denied' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleRequestPermission}
                      >
                        Enable notifications
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mb-4">
              <Button onClick={handleCreateNew} className="flex-1">
                <Plus className="mr-2 size-4" />
                New Reminder
              </Button>
              <Button variant="outline" onClick={() => setView('templates')}>
                Templates
              </Button>
            </div>

            {/* Reminder list */}
            <div className="flex-1 overflow-auto">
              <ReminderList onEdit={handleEditReminder} />
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'create':
        return 'New Reminder';
      case 'edit':
        return 'Edit Reminder';
      case 'templates':
        return 'Reminder Templates';
      default:
        return 'Reminders';
    }
  };

  const getDescription = () => {
    switch (view) {
      case 'create':
        return 'Create a custom reminder';
      case 'edit':
        return 'Update your reminder settings';
      case 'templates':
        return 'Browse and enable preset reminders';
      default:
        return `${state.reminders?.length ?? 0} reminder${(state.reminders?.length ?? 0) !== 1 ? 's' : ''} configured`;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden mt-6 px-2">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
