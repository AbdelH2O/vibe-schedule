'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { validateIntervalMinutes, validateTimeString } from '@/lib/reminders';
import type { Reminder, ReminderType, ReminderScope, ReminderConfig, DayOfWeek } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

interface ReminderFormProps {
  reminder?: Reminder;
  onComplete: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
] as const;

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export function ReminderForm({ reminder, onComplete, onCancel }: ReminderFormProps) {
  const { addReminder, updateReminder } = useStore();
  const isEditing = !!reminder;

  // Form state
  const [title, setTitle] = useState(reminder?.title ?? '');
  const [message, setMessage] = useState(reminder?.message ?? '');
  const [type, setType] = useState<ReminderType>(reminder?.config.type ?? 'interval');
  const [scope, setScope] = useState<ReminderScope>(reminder?.scope ?? 'always');

  // Type-specific state
  const [intervalMinutes, setIntervalMinutes] = useState(
    reminder?.config.type === 'interval' ? reminder.config.intervalMinutes : 30
  );
  const [fixedTime, setFixedTime] = useState(
    reminder?.config.type === 'fixed-time' ? reminder.config.time : '09:00'
  );
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    reminder?.config.type === 'fixed-time' ? reminder.config.days : []
  );
  const [selectedPrayers, setSelectedPrayers] = useState<typeof PRAYER_NAMES[number][]>(
    reminder?.config.type === 'prayer' ? reminder.config.prayers : ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  );
  const [minutesBefore, setMinutesBefore] = useState(
    reminder?.config.type === 'prayer' ? reminder.config.minutesBefore : 0
  );

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (type === 'interval') {
      if (!validateIntervalMinutes(intervalMinutes)) {
        newErrors.interval = 'Interval must be between 1 and 1440 minutes';
      }
    }

    if (type === 'fixed-time') {
      if (!validateTimeString(fixedTime)) {
        newErrors.time = 'Invalid time format (use HH:MM)';
      }
    }

    if (type === 'prayer') {
      if (selectedPrayers.length === 0) {
        newErrors.prayers = 'Select at least one prayer';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildConfig = (): ReminderConfig => {
    switch (type) {
      case 'interval':
        return { type: 'interval', intervalMinutes };
      case 'fixed-time':
        return { type: 'fixed-time', time: fixedTime, days: selectedDays };
      case 'prayer':
        return { type: 'prayer', prayers: selectedPrayers, minutesBefore };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const config = buildConfig();

    if (isEditing && reminder) {
      updateReminder(reminder.id, {
        title: title.trim(),
        message: message.trim() || undefined,
        config,
        scope,
      });
    } else {
      addReminder({
        title: title.trim(),
        message: message.trim() || undefined,
        config,
        enabled: true,
        scope,
      });
    }

    onComplete();
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const togglePrayer = (prayer: typeof PRAYER_NAMES[number]) => {
    setSelectedPrayers((prev) =>
      prev.includes(prayer) ? prev.filter((p) => p !== prayer) : [...prev, prayer]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back button */}
      <Button type="button" variant="ghost" onClick={onCancel} className="-ml-2">
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Button>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Drink water"
          maxLength={100}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Message (optional) */}
      <div className="space-y-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional custom message"
          rows={2}
        />
      </div>

      {/* Type selector */}
      <div className="space-y-2">
        <Label>Reminder type</Label>
        <Select value={type} onValueChange={(v) => setType(v as ReminderType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interval">Interval (every X minutes)</SelectItem>
            <SelectItem value="fixed-time">Fixed time (specific time of day)</SelectItem>
            <SelectItem value="prayer">Prayer times</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type-specific fields */}
      {type === 'interval' && (
        <div className="space-y-2">
          <Label htmlFor="interval">Interval (minutes)</Label>
          <Input
            id="interval"
            type="number"
            min={1}
            max={1440}
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">
            {intervalMinutes >= 60
              ? `${Math.floor(intervalMinutes / 60)} hour${Math.floor(intervalMinutes / 60) !== 1 ? 's' : ''} ${
                  intervalMinutes % 60 > 0 ? `${intervalMinutes % 60} min` : ''
                }`
              : `${intervalMinutes} minutes`}
          </p>
          {errors.interval && (
            <p className="text-sm text-destructive">{errors.interval}</p>
          )}
        </div>
      )}

      {type === 'fixed-time' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={fixedTime}
              onChange={(e) => setFixedTime(e.target.value)}
            />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Days (leave empty for every day)</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {type === 'prayer' && (
        <>
          <div className="space-y-3">
            <Label>Prayers</Label>
            <div className="space-y-2">
              {PRAYER_NAMES.map((prayer) => (
                <div key={prayer} className="flex items-center space-x-2">
                  <Checkbox
                    id={prayer}
                    checked={selectedPrayers.includes(prayer)}
                    onCheckedChange={() => togglePrayer(prayer)}
                  />
                  <Label htmlFor={prayer} className="font-normal">
                    {prayer}
                  </Label>
                </div>
              ))}
            </div>
            {errors.prayers && (
              <p className="text-sm text-destructive">{errors.prayers}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutesBefore">Notify before prayer (minutes)</Label>
            <Input
              id="minutesBefore"
              type="number"
              min={0}
              max={60}
              value={minutesBefore}
              onChange={(e) => setMinutesBefore(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              {minutesBefore === 0 ? 'At prayer time' : `${minutesBefore} minutes before`}
            </p>
          </div>
        </>
      )}

      {/* Scope */}
      <div className="space-y-2">
        <Label>Active when</Label>
        <Select value={scope} onValueChange={(v) => setScope(v as ReminderScope)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="always">Always (definition & working modes)</SelectItem>
            <SelectItem value="session-only">Session only (working mode)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {isEditing ? 'Save Changes' : 'Create Reminder'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
