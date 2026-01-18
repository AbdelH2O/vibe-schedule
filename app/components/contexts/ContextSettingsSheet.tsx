'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
import type { ContextColorName } from '@/lib/colors';
import type { Context } from '@/lib/types';

interface ContextSettingsSheetProps {
  context: Context;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContextSettingsSheet({
  context,
  open,
  onOpenChange,
}: ContextSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="overflow-y-auto"
        aria-describedby="settings-description"
      >
        <SheetHeader>
          <SheetTitle>Context Settings</SheetTitle>
          <SheetDescription id="settings-description">
            Configure name, color, priority, and time constraints.
          </SheetDescription>
        </SheetHeader>

        {/* Key ensures form resets when context changes or sheet reopens */}
        {open && (
          <ContextSettingsForm
            key={`${context.id}-${context.updatedAt}`}
            context={context}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface ContextSettingsFormProps {
  context: Context;
  onClose: () => void;
}

function ContextSettingsForm({ context, onClose }: ContextSettingsFormProps) {
  const { updateContext } = useStore();

  // Form state initialized from context props
  const [name, setName] = useState(context.name);
  const [priority, setPriority] = useState(context.priority);
  const [color, setColor] = useState<ContextColorName>(context.color);
  const [minDuration, setMinDuration] = useState(context.minDuration?.toString() ?? '');
  const [maxDuration, setMaxDuration] = useState(context.maxDuration?.toString() ?? '');
  const [weight, setWeight] = useState(context.weight.toString());
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('Context name is required');
      return false;
    }

    const min = minDuration ? parseInt(minDuration, 10) : undefined;
    const max = maxDuration ? parseInt(maxDuration, 10) : undefined;

    if (min !== undefined && max !== undefined && min > max) {
      setError('Minimum duration cannot exceed maximum duration');
      return false;
    }

    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setError('Weight must be a positive number');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateContext(context.id, {
      name: name.trim(),
      priority,
      color,
      minDuration: minDuration ? parseInt(minDuration, 10) : undefined,
      maxDuration: maxDuration ? parseInt(maxDuration, 10) : undefined,
      weight: parseFloat(weight),
    });

    onClose();
  };

  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="settings-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="settings-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Context name"
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label id="settings-color-label">Color</Label>
        <ColorPicker value={color} onChange={setColor} id="settings-color" />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="settings-priority">Priority</Label>
        <Select
          value={priority.toString()}
          onValueChange={(v) => setPriority(parseInt(v, 10))}
        >
          <SelectTrigger id="settings-priority">
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
		<p className="text-xs text-muted-foreground">
          	Higher priority contexts are placed earlier during time distribution
        </p>
      </div>

      <Separator />

      {/* Time Constraints */}
      <div className="space-y-3">
        <Label>Time Constraints</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="settings-min-duration" className="text-xs text-muted-foreground">
              Min Duration
            </Label>
            <DurationInput
              id="settings-min-duration"
              value={minDuration}
              onChange={setMinDuration}
              placeholder="None"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="settings-max-duration" className="text-xs text-muted-foreground">
              Max Duration
            </Label>
            <DurationInput
              id="settings-max-duration"
              value={maxDuration}
              onChange={setMaxDuration}
              placeholder="None"
            />
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <Label htmlFor="settings-weight">Weight</Label>
        <Input
          id="settings-weight"
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

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Save button */}
      <Button onClick={handleSave} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}
