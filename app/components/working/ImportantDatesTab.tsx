'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ImportantDateItem } from './ImportantDateItem';
import { ImportantDateForm } from './ImportantDateForm';
import type { AggregatedDeadline } from './WorkingSidebar';
import type { DeadlineScopeFilter } from '@/lib/types';

interface ImportantDatesTabProps {
  allDeadlines: AggregatedDeadline[];
  activeContextId: string | null;
  scopeFilter: DeadlineScopeFilter;
  onScopeFilterChange: (filter: DeadlineScopeFilter) => void;
  onAddDeadline: (label: string, date: string) => void;
  onDeleteDeadline: (contextId: string, dateId: string) => void;
}

export function ImportantDatesTab({
  allDeadlines,
  activeContextId,
  scopeFilter,
  onScopeFilterChange,
  onAddDeadline,
  onDeleteDeadline,
}: ImportantDatesTabProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (label: string, date: string) => {
    onAddDeadline(label, date);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // Show context badge when viewing "all contexts"
  const showContextBadge = scopeFilter === 'all';

  if (showForm) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Add Important Date</h3>
        <ImportantDateForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    );
  }

  const handleScopeToggle = (checked: boolean) => {
    onScopeFilterChange(checked ? 'active-context' : 'all');
  };

  return (
    <div className="space-y-4">
      {/* Scope filter toggle */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b">
        <Label
          htmlFor="scope-filter"
          className="text-xs text-muted-foreground cursor-pointer"
        >
          {scopeFilter === 'all' ? 'All contexts' : 'Active context only'}
        </Label>
        <Switch
          id="scope-filter"
          checked={scopeFilter === 'active-context'}
          onCheckedChange={handleScopeToggle}
          aria-label="Toggle between all contexts and active context only"
        />
      </div>

      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {allDeadlines.length} {allDeadlines.length === 1 ? 'deadline' : 'deadlines'}
        </h3>
        {activeContextId && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" />
            Add
          </Button>
        )}
      </div>

      {/* Deadline list */}
      {allDeadlines.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {scopeFilter === 'active-context' && activeContextId
              ? 'No deadlines for this context.'
              : 'No important dates configured.'}
          </p>
          {activeContextId && (
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => setShowForm(true)}
            >
              Add one now
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {allDeadlines.map((d) => (
            <ImportantDateItem
              key={d.date.id}
              dateId={d.date.id}
              label={d.date.label}
              date={d.date.date}
              contextId={d.contextId}
              contextName={d.contextName}
              contextColor={d.contextColor}
              showContextBadge={showContextBadge}
              onDelete={onDeleteDeadline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
