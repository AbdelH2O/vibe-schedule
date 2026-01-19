// Aladhan Prayer Times API integration

import type { UserLocation, DailyPrayerTimes, PrayerTimesCache } from './types';

const API_BASE = 'https://api.aladhan.com/v1';
const CACHE_KEY = 'prayer-times-cache';
const CACHE_DAYS = 7;

/**
 * Format date for API (DD-MM-YYYY)
 */
function formatDateForApi(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format date for storage (YYYY-MM-DD)
 */
function formatDateForStorage(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Fetch prayer times from Aladhan API
 */
export async function fetchPrayerTimes(
  city: string,
  method: number,
  date: Date
): Promise<DailyPrayerTimes> {
  const dateStr = formatDateForApi(date);
  const url = `${API_BASE}/timingsByAddress/${dateStr}?address=${encodeURIComponent(city)}&method=${method}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch prayer times: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200 || !data.data?.timings) {
    throw new Error('Invalid response from Aladhan API');
  }

  const timings = data.data.timings;

  return {
    date: formatDateForStorage(date),
    times: {
      Fajr: timings.Fajr,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    },
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch prayer times for multiple days
 */
export async function fetchPrayerTimesRange(
  location: UserLocation,
  startDate: Date,
  days: number
): Promise<DailyPrayerTimes[]> {
  const results: DailyPrayerTimes[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    try {
      const times = await fetchPrayerTimes(location.city, location.method, date);
      results.push(times);
    } catch (error) {
      console.error(`Failed to fetch prayer times for ${formatDateForStorage(date)}:`, error);
      // Continue with other days even if one fails
    }
  }

  return results;
}

/**
 * Get cached prayer times from localStorage
 */
export function getCachedPrayerTimes(): PrayerTimesCache | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cache = JSON.parse(cached) as PrayerTimesCache;

    // Check if cache is still valid (within 7 days)
    const lastUpdated = new Date(cache.lastUpdated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > CACHE_DAYS) {
      return null; // Cache expired
    }

    return cache;
  } catch (error) {
    console.error('Failed to read prayer times cache:', error);
    return null;
  }
}

/**
 * Save prayer times to localStorage cache
 */
export function cachePrayerTimes(location: UserLocation, times: DailyPrayerTimes[]): void {
  if (typeof window === 'undefined') return;

  try {
    const cache: PrayerTimesCache = {
      location,
      days: times,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache prayer times:', error);
  }
}

/**
 * Clear prayer times cache
 */
export function clearPrayerTimesCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Get prayer times for today, using cache if available
 */
export async function getPrayerTimesForToday(
  location: UserLocation
): Promise<DailyPrayerTimes | null> {
  const today = formatDateForStorage(new Date());
  const cache = getCachedPrayerTimes();

  // Check if we have cached times for today with matching location
  if (
    cache &&
    cache.location.city === location.city &&
    cache.location.method === location.method
  ) {
    const todayTimes = cache.days.find((d) => d.date === today);
    if (todayTimes) {
      return todayTimes;
    }
  }

  // Fetch fresh data
  try {
    const todayDate = new Date();
    const times = await fetchPrayerTimesRange(location, todayDate, CACHE_DAYS);
    cachePrayerTimes(location, times);
    return times.find((d) => d.date === today) ?? null;
  } catch (error) {
    console.error('Failed to fetch prayer times:', error);

    // Fall back to cached data even if location doesn't match
    if (cache) {
      const todayTimes = cache.days.find((d) => d.date === today);
      if (todayTimes) {
        return todayTimes;
      }
    }

    return null;
  }
}

/**
 * Get next prayer time from today's times
 */
export function getNextPrayerTime(
  todayTimes: DailyPrayerTimes,
  prayers: ('Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha')[],
  now: Date = new Date()
): { prayer: string; time: Date } | null {
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Find the next prayer that hasn't passed yet
  for (const prayer of prayers) {
    const prayerTime = todayTimes.times[prayer];
    if (prayerTime > currentTimeStr) {
      const [hours, minutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);
      return { prayer, time: prayerDate };
    }
  }

  // All prayers for today have passed, return first prayer tomorrow
  if (prayers.length > 0) {
    const firstPrayer = prayers[0];
    const prayerTime = todayTimes.times[firstPrayer];
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    return { prayer: firstPrayer, time: tomorrow };
  }

  return null;
}

/**
 * Common calculation methods for dropdown
 */
export const CALCULATION_METHODS = [
  { id: 2, name: 'ISNA', region: 'North America' },
  { id: 3, name: 'Muslim World League', region: 'Europe, Far East' },
  { id: 4, name: 'Umm Al-Qura', region: 'Arabian Peninsula' },
  { id: 5, name: 'Egyptian', region: 'Africa, Syria, Lebanon' },
  { id: 1, name: 'University of Islamic Sciences, Karachi', region: 'Pakistan, Afghanistan' },
  { id: 15, name: 'Moonsighting Committee', region: 'Global' },
] as const;
