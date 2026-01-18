'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DURATION_OPTIONS = [
  { label: 'No limit', value: '' },
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
  { label: '2 hours', value: '120' },
  { label: '3 hours', value: '180' },
  { label: '4 hours', value: '240' },
  { label: 'Custom...', value: 'custom' },
];

interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function DurationInput({
  value,
  onChange,
  id,
  placeholder = 'Select duration',
}: DurationInputProps) {
  // Track if user explicitly entered custom mode
  const [customMode, setCustomMode] = useState(false);

  // Derive whether to show custom input based on:
  // 1. User explicitly selected "Custom..." OR
  // 2. Current value doesn't match any preset (excluding empty)
  const showCustomInput = useMemo(() => {
    if (customMode) return true;
    if (value === '') return false;
    return !DURATION_OPTIONS.some(
      (opt) => opt.value === value && opt.value !== 'custom' && opt.value !== ''
    );
  }, [customMode, value]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setCustomMode(true);
      // Keep current value or set a default
      if (!value) {
        onChange('60');
      }
    } else {
      setCustomMode(false);
      onChange(selectedValue);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty or positive numbers
    if (newValue === '' || /^\d+$/.test(newValue)) {
      onChange(newValue);
    }
  };

  if (showCustomInput) {
    return (
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          min="1"
          value={value}
          onChange={handleCustomChange}
          placeholder="Minutes"
          className="flex-1"
        />
        <Select value="custom" onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value || 'none'} value={option.value || 'none'}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Select
      value={value || 'none'}
      onValueChange={(v) => handleSelectChange(v === 'none' ? '' : v)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {DURATION_OPTIONS.map((option) => (
          <SelectItem key={option.value || 'none'} value={option.value || 'none'}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
