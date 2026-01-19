'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export interface FilePickerButtonProps {
  /** Button label */
  label: string;
  /** Accepted file types (e.g., ".json,application/json") */
  accept: string;
  /** Callback when file is selected */
  onFileSelected: (file: File) => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary';
  /** Optional className for additional styling */
  className?: string;
}

export function FilePickerButton({
  label,
  accept,
  onFileSelected,
  disabled = false,
  variant = 'outline',
  className,
}: FilePickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
      // Reset input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        type="button"
        variant={variant}
        onClick={handleClick}
        disabled={disabled}
        className={className}
      >
        <Upload className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </>
  );
}
