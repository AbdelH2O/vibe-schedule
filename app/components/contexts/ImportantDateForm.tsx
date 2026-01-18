'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { ImportantDate } from '@/lib/types';

interface ImportantDateFormProps {
  onAdd: (date: Omit<ImportantDate, 'id'>) => void;
  compact?: boolean;
}

export function ImportantDateForm({ onAdd, compact = false }: ImportantDateFormProps) {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      setError('Label is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    onAdd({
      label: label.trim(),
      date,
    });

    setLabel('');
    setDate('');
    setError(null);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Milestone name"
          className="h-7 text-xs flex-1 min-w-0"
          aria-label="Milestone name"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-7 text-xs w-32"
          aria-label="Milestone date"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="size-7 shrink-0"
          aria-label="Add milestone"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="date-label" className="text-xs">
            Label
          </Label>
          <Input
            id="date-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Project Deadline"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="date-value" className="text-xs">
            Date
          </Label>
          <Input
            id="date-value"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" variant="outline" className="w-full">
        <Plus className="size-3 mr-1" aria-hidden="true" />
        Add Date
      </Button>
    </form>
  );
}
