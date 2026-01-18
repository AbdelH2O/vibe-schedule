'use client';

import { useCallback, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTEXT_COLORS, contextColors, type ContextColorName } from '@/lib/colors';

interface ColorPickerProps {
  value: ContextColorName;
  onChange: (color: ContextColorName) => void;
  id?: string;
}

// Human-readable color names for accessibility
const colorLabels: Record<ContextColorName, string> = {
  blue: 'Blue',
  green: 'Green',
  purple: 'Purple',
  amber: 'Amber',
  rose: 'Rose',
  teal: 'Teal',
  orange: 'Orange',
  slate: 'Slate',
};

export function ColorPicker({ value, onChange, id }: ColorPickerProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation within the color grid
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;
      const cols = 4; // 4 columns in the grid
      const total = CONTEXT_COLORS.length;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          newIndex = (currentIndex + 1) % total;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = (currentIndex - 1 + total) % total;
          break;
        case 'ArrowDown':
          e.preventDefault();
          newIndex = (currentIndex + cols) % total;
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = (currentIndex - cols + total) % total;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = total - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onChange(CONTEXT_COLORS[currentIndex]);
          return;
        default:
          return;
      }

      // Focus the new element
      const buttons = gridRef.current?.querySelectorAll('button');
      if (buttons?.[newIndex]) {
        (buttons[newIndex] as HTMLButtonElement).focus();
      }
    },
    [onChange]
  );

  return (
    <div
      ref={gridRef}
      id={id}
      role="radiogroup"
      aria-label="Select a color"
      className="grid grid-cols-4 gap-2"
    >
      {CONTEXT_COLORS.map((colorName, index) => {
        const color = contextColors[colorName];
        const isSelected = value === colorName;

        return (
          <button
            key={colorName}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={colorLabels[colorName]}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(colorName)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'relative size-10 rounded-lg transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'hover:scale-110',
              color.dot,
              isSelected && 'ring-2 ring-offset-2 ring-foreground/50'
            )}
          >
            {isSelected && (
              <Check
                className="absolute inset-0 m-auto size-5 text-white drop-shadow-md"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
