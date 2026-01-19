'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useClickOutside } from '@/lib/hooks';
import { getDeadlineUrgency } from '@/lib/dates';
import { getNextTriggerTime } from '@/lib/reminders';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportantDatesTab } from './ImportantDatesTab';
import { RemindersTab } from './RemindersTab';
import type { Context, Session, ImportantDate, DeadlineScopeFilter, DeadlineUrgency } from '@/lib/types';
import type { ContextColorName } from '@/lib/colors';
import { SidebarIconRail } from './SidebarIconRail';
import { SidebarPanel } from './SidebarPanel';

export interface AggregatedDeadline {
  date: ImportantDate;
  contextId: string;
  contextName: string;
  contextColor: ContextColorName;
  urgency: DeadlineUrgency;
}

interface WorkingSidebarProps {
  session: Session;
  sessionContexts: Context[];
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function WorkingSidebar({ session, sessionContexts, mobileOpen, onMobileOpenChange }: WorkingSidebarProps) {
  const { state, updateSidebarPreferences, getReminders, addImportantDate, deleteImportantDate, deleteReminder } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dates' | 'reminders'>('dates');

  const panelRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Close panel on click outside
  useClickOutside([panelRef, railRef], () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  // Close panel on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Aggregate deadlines from all session contexts
  const allDeadlines = useMemo((): AggregatedDeadline[] => {
    const deadlines: AggregatedDeadline[] = [];
    for (const ctx of sessionContexts) {
      if (ctx.importantDates) {
        for (const date of ctx.importantDates) {
          deadlines.push({
            date,
            contextId: ctx.id,
            contextName: ctx.name,
            contextColor: ctx.color,
            urgency: getDeadlineUrgency(date.date),
          });
        }
      }
    }
    // Sort by urgency: overdue first, then urgent, warning, neutral
    const urgencyOrder: Record<DeadlineUrgency, number> = {
      overdue: 0,
      urgent: 1,
      warning: 2,
      neutral: 3,
    };
    return deadlines.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  }, [sessionContexts]);

  // Filter deadlines based on scope preference
  const scopeFilter = state.sidebarPreferences?.deadlineScopeFilter ?? 'all';
  const filteredDeadlines = useMemo(() => {
    if (scopeFilter === 'active-context' && session.activeContextId) {
      return allDeadlines.filter((d) => d.contextId === session.activeContextId);
    }
    return allDeadlines;
  }, [allDeadlines, scopeFilter, session.activeContextId]);

  // Get all reminders
  const reminders = getReminders();

  // Urgency detection - update every 60 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const hasUrgentDates = useMemo(() => {
    return filteredDeadlines.some(
      (d) => d.urgency === 'overdue' || d.urgency === 'urgent'
    );
  }, [filteredDeadlines]);

  const hasImminentReminders = useMemo(() => {
    return reminders.some((r) => {
      if (!r.enabled) return false;
      const nextTrigger = getNextTriggerTime(r);
      if (!nextTrigger) return false;
      const minutesUntil = (nextTrigger.getTime() - Date.now()) / 60000;
      return minutesUntil <= 15 && minutesUntil > 0;
    });
  }, [reminders]);

  // Handlers
  const handleDatesClick = useCallback(() => {
    setActiveTab('dates');
    setIsOpen(true);
  }, []);

  const handleRemindersClick = useCallback(() => {
    setActiveTab('reminders');
    setIsOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: 'dates' | 'reminders') => {
    setActiveTab(tab);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleScopeFilterChange = useCallback(
    (filter: DeadlineScopeFilter) => {
      updateSidebarPreferences({ deadlineScopeFilter: filter });
    },
    [updateSidebarPreferences]
  );

  const handleAddDeadline = useCallback(
    (label: string, date: string) => {
      if (session.activeContextId) {
        addImportantDate(session.activeContextId, { label, date });
      }
    },
    [session.activeContextId, addImportantDate]
  );

  const handleDeleteDeadline = useCallback(
    (contextId: string, dateId: string) => {
      deleteImportantDate(contextId, dateId);
    },
    [deleteImportantDate]
  );

  const handleDeleteReminder = useCallback(
    (id: string) => {
      deleteReminder(id);
    },
    [deleteReminder]
  );

  return (
    <>
      {/* Desktop: Icon rail */}
      <SidebarIconRail
        ref={railRef}
        datesCount={filteredDeadlines.length}
        remindersCount={reminders.length}
        hasUrgentDates={hasUrgentDates}
        hasImminentReminders={hasImminentReminders}
        onDatesClick={handleDatesClick}
        onRemindersClick={handleRemindersClick}
        activeTab={isOpen ? activeTab : null}
      />

      {/* Desktop: Expanded panel */}
      <SidebarPanel
        ref={panelRef}
        isOpen={isOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={handleClose}
        allDeadlines={filteredDeadlines}
        activeContextId={session.activeContextId}
        scopeFilter={scopeFilter}
        onScopeFilterChange={handleScopeFilterChange}
        onAddDeadline={handleAddDeadline}
        onDeleteDeadline={handleDeleteDeadline}
        reminders={reminders}
        onDeleteReminder={handleDeleteReminder}
      />

      {/* Mobile: Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="sr-only">Sidebar</SheetTitle>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'dates' | 'reminders')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dates">Dates</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
              </TabsList>
            </Tabs>
          </SheetHeader>
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'dates' && (
              <ImportantDatesTab
                allDeadlines={filteredDeadlines}
                activeContextId={session.activeContextId}
                scopeFilter={scopeFilter}
                onScopeFilterChange={handleScopeFilterChange}
                onAddDeadline={handleAddDeadline}
                onDeleteDeadline={handleDeleteDeadline}
              />
            )}
            {activeTab === 'reminders' && (
              <RemindersTab
                reminders={reminders}
                onDeleteReminder={handleDeleteReminder}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
