'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
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
import { CALCULATION_METHODS } from '@/lib/prayerTimes';
import { MapPin, Loader2 } from 'lucide-react';
import type { CalculationMethodId } from '@/lib/types';

interface LocationPickerProps {
  onComplete?: () => void;
}

export function LocationPicker({ onComplete }: LocationPickerProps) {
  const { state, setUserLocation } = useStore();
  const [city, setCity] = useState(state.userLocation?.city ?? '');
  const [method, setMethod] = useState<CalculationMethodId>(
    state.userLocation?.method ?? 2
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test if the location works by fetching prayer times
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByAddress/${formatTodayForApi()}?address=${encodeURIComponent(city.trim())}&method=${method}`
      );
      const data = await response.json();

      if (data.code !== 200) {
        throw new Error('Could not find prayer times for this location');
      }

      // Location is valid, save it
      setUserLocation({ city: city.trim(), method });
      onComplete?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not verify location. Please try a different city name.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        <span>Set your location for accurate prayer times</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., London, UK"
        />
        <p className="text-xs text-muted-foreground">
          Enter your city name with country for best accuracy
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Calculation Method</Label>
        <Select
          value={String(method)}
          onValueChange={(v) => setMethod(parseInt(v) as CalculationMethodId)}
        >
          <SelectTrigger id="method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CALCULATION_METHODS.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.name} ({m.region})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Verifying location...
          </>
        ) : (
          'Save Location'
        )}
      </Button>
    </div>
  );
}

function formatTodayForApi(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}
