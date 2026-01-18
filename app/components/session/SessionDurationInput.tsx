'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseDuration, formatDuration, validateDuration } from '@/lib/allocation';
import { cn } from '@/lib/utils';

interface SessionDurationInputProps {
  value: number | null;
  onChange: (minutes: number | null) => void;
  className?: string;
}

export function SessionDurationInput({
  value,
  onChange,
  className,
}: SessionDurationInputProps) {
  // Track both the raw input string and whether user is actively editing
  const [inputState, setInputState] = useState<{ text: string; isEditing: boolean }>({
    text: '',
    isEditing: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Derive displayed value: show user's input when editing, otherwise show controlled value
  const displayedInput = inputState.isEditing
    ? inputState.text
    : value !== null
      ? String(value)
      : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputState({ text: raw, isEditing: true });

    // Clear error while typing
    if (error) {
      setError(null);
    }

    // Parse the input
    const parsed = parseDuration(raw);

    if (raw.trim() === '') {
      onChange(null);
      return;
    }

    if (parsed === null) {
      setError('Enter hours (e.g., 2), h:mm (e.g., 1:30), or with suffix (e.g., 90min, 2h)');
      onChange(null);
      return;
    }

    // Validate the range
    const validation = validateDuration(parsed);
    if (!validation.valid) {
      setError(validation.error || 'Invalid duration');
      onChange(null);
      return;
    }

    onChange(parsed);
  };

  const handleFocus = () => {
    // When focusing, start editing with current value
    setInputState({ text: value !== null ? String(value) : '', isEditing: true });
  };

  const handleBlur = () => {
    // Stop editing mode on blur
    setInputState((prev) => ({ ...prev, isEditing: false }));

    // Re-validate on blur to show any errors
    const textToValidate = inputState.text;
    if (textToValidate.trim() === '') {
      return;
    }

    const parsed = parseDuration(textToValidate);
    if (parsed === null) {
      setError('Enter hours (e.g., 2), h:mm (e.g., 1:30), or with suffix (e.g., 90min, 2h)');
      return;
    }

    const validation = validateDuration(parsed);
    if (!validation.valid) {
      setError(validation.error || 'Invalid duration');
    }
  };

  const displayValue = value !== null ? formatDuration(value) : null;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="session-duration">Session Duration</Label>
      <div className="flex items-center gap-3">
        <Input
          id="session-duration"
          type="text"
          inputMode="numeric"
          placeholder="e.g., 2 or 1:30"
          value={displayedInput}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={error !== null}
          aria-describedby={error ? 'duration-error' : displayValue ? 'duration-display' : undefined}
          className="w-32"
        />
        {displayValue && !error && (
          <span id="duration-display" className="text-sm text-muted-foreground">
            {displayValue}
          </span>
        )}
      </div>
      {error && (
        <p id="duration-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
