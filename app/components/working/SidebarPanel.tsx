'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ImportantDatesTab } from './ImportantDatesTab';
import { RemindersTab } from './RemindersTab';
import type { AggregatedDeadline } from './WorkingSidebar';
import type { Reminder, DeadlineScopeFilter } from '@/lib/types';

interface SidebarPanelProps {
  isOpen: boolean;
  activeTab: 'dates' | 'reminders';
  onTabChange: (tab: 'dates' | 'reminders') => void;
  onClose: () => void;
  // Dates tab props
  allDeadlines: AggregatedDeadline[];
  activeContextId: string | null;
  scopeFilter: DeadlineScopeFilter;
  onScopeFilterChange: (filter: DeadlineScopeFilter) => void;
  onAddDeadline: (label: string, date: string) => void;
  onDeleteDeadline: (contextId: string, dateId: string) => void;
  // Reminders tab props
  reminders: Reminder[];
  onDeleteReminder: (id: string) => void;
}

export const SidebarPanel = forwardRef<HTMLDivElement, SidebarPanelProps>(
  function SidebarPanel(
    {
      isOpen,
      activeTab,
      onTabChange,
      onClose,
      allDeadlines,
      activeContextId,
      scopeFilter,
      onScopeFilterChange,
      onAddDeadline,
      onDeleteDeadline,
      reminders,
      onDeleteReminder,
    },
    ref
  ) {
    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'fixed right-12 top-1/2 -translate-y-1/2 z-30 w-80 max-h-[70vh] bg-card border rounded-lg shadow-xl',
          'hidden lg:flex flex-col',
          'animate-in slide-in-from-right-4 duration-200'
        )}
        role="complementary"
        aria-label="Sidebar panel"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 border-b">
          <Tabs
            value={activeTab}
            onValueChange={(v) => onTabChange(v as 'dates' | 'reminders')}
            className="flex-1"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'dates' && (
            <ImportantDatesTab
              allDeadlines={allDeadlines}
              activeContextId={activeContextId}
              scopeFilter={scopeFilter}
              onScopeFilterChange={onScopeFilterChange}
              onAddDeadline={onAddDeadline}
              onDeleteDeadline={onDeleteDeadline}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersTab
              reminders={reminders}
              onDeleteReminder={onDeleteReminder}
            />
          )}
        </div>
      </div>
    );
  }
);
