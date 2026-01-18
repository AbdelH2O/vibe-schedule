'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import { DurationInput } from '../shared/DurationInput';
import { ColorPicker } from '../shared/ColorPicker';
import { ImportantDateForm } from './ImportantDateForm';
import { ImportantDateList } from './ImportantDateList';
import { generateId } from '@/lib/storage';
import { getDefaultColorByIndex, type ContextColorName } from '@/lib/colors';
import type { Context, ImportantDate } from '@/lib/types';

interface ContextFormProps {
  initialData?: Context;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContextForm({ initialData, onSuccess, onCancel }: ContextFormProps) {
  const { addContext, updateContext, state } = useStore();
  const isEditing = !!initialData;

  // Get default color based on existing context count
  const defaultColor = getDefaultColorByIndex(state.contexts.length);

  // Form state
  const [name, setName] = useState(initialData?.name ?? '');
  const [priority, setPriority] = useState(initialData?.priority ?? 3);
  const [color, setColor] = useState<ContextColorName>(initialData?.color ?? defaultColor);
  const [minDuration, setMinDuration] = useState<string>(
    initialData?.minDuration?.toString() ?? ''
  );
  const [maxDuration, setMaxDuration] = useState<string>(
    initialData?.maxDuration?.toString() ?? ''
  );
  const [weight, setWeight] = useState<string>(
    initialData?.weight?.toString() ?? '1'
  );
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(
    initialData?.importantDates ?? []
  );
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    // Name validation
    if (!name.trim()) {
      setError('Context name is required');
      return false;
    }

    // Duration validation
    const min = minDuration ? parseInt(minDuration, 10) : undefined;
    const max = maxDuration ? parseInt(maxDuration, 10) : undefined;

    if (min !== undefined && max !== undefined && min > max) {
      setError('Minimum duration cannot exceed maximum duration');
      return false;
    }

    // Weight validation
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setError('Weight must be a positive number');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const contextData = {
      name: name.trim(),
      priority,
      color,
      minDuration: minDuration ? parseInt(minDuration, 10) : undefined,
      maxDuration: maxDuration ? parseInt(maxDuration, 10) : undefined,
      weight: parseFloat(weight),
      importantDates: importantDates.length > 0 ? importantDates : undefined,
    };

    if (isEditing && initialData) {
      updateContext(initialData.id, contextData);
    } else {
      addContext(contextData);
    }

    onSuccess?.();
  };

  const handleAddDate = (date: Omit<ImportantDate, 'id'>) => {
    setImportantDates([
      ...importantDates,
      { ...date, id: generateId() },
    ]);
  };

  const handleRemoveDate = (id: string) => {
    setImportantDates(importantDates.filter((d) => d.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="context-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="context-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Deep Work, Admin, Learning"
          aria-describedby={error ? 'form-error' : undefined}
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label id="context-color-label">Color</Label>
        <ColorPicker
          value={color}
          onChange={setColor}
          id="context-color"
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="context-priority">Priority</Label>
        <Select
          value={priority.toString()}
          onValueChange={(v) => setPriority(parseInt(v, 10))}
        >
          <SelectTrigger id="context-priority" className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Highest</SelectItem>
            <SelectItem value="2">2 - High</SelectItem>
            <SelectItem value="3">3 - Medium</SelectItem>
            <SelectItem value="4">4 - Low</SelectItem>
            <SelectItem value="5">5 - Lowest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duration constraints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="context-min-duration">Min Duration</Label>
          <DurationInput
            id="context-min-duration"
            value={minDuration}
            onChange={setMinDuration}
            placeholder="No minimum"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="context-max-duration">Max Duration</Label>
          <DurationInput
            id="context-max-duration"
            value={maxDuration}
            onChange={setMaxDuration}
            placeholder="No maximum"
          />
        </div>
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <Label htmlFor="context-weight">Weight</Label>
        <Input
          id="context-weight"
          type="number"
          min="0.1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="1"
        />
        <p className="text-xs text-muted-foreground">
          Higher weights receive more time during distribution
        </p>
      </div>

      {isEditing && (
        <>
          <Separator />

          {/* Important Dates - only shown when editing */}
          <div className="space-y-3">
            <Label>Important Dates</Label>
            {importantDates.length > 0 && (
              <ImportantDateList
                dates={importantDates}
                onRemove={handleRemoveDate}
              />
            )}
            <ImportantDateForm onAdd={handleAddDate} />
          </div>
        </>
      )}

      {/* Error display */}
      {error && (
        <p id="form-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {isEditing ? 'Save Changes' : 'Create Context'}
        </Button>
      </div>
    </form>
  );
}
