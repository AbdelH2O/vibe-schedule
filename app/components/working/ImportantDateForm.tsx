'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImportantDateFormProps {
  onSubmit: (label: string, date: string) => void;
  onCancel: () => void;
}

export function ImportantDateForm({ onSubmit, onCancel }: ImportantDateFormProps) {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<{ label?: string; date?: string }>({});

  const validate = (): boolean => {
    const newErrors: { label?: string; date?: string } = {};

    if (!label.trim()) {
      newErrors.label = 'Label is required';
    } else if (label.length > 100) {
      newErrors.label = 'Label must be 100 characters or less';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(label.trim(), date);
      setLabel('');
      setDate('');
      setErrors({});
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date-label">Label</Label>
        <Input
          id="date-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Project deadline"
          maxLength={100}
          aria-invalid={!!errors.label}
          aria-describedby={errors.label ? 'label-error' : undefined}
        />
        {errors.label && (
          <p id="label-error" className="text-sm text-destructive">
            {errors.label}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-value">Date</Label>
        <Input
          id="date-value"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={today}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {errors.date && (
          <p id="date-error" className="text-sm text-destructive">
            {errors.date}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Date</Button>
      </div>
    </form>
  );
}
