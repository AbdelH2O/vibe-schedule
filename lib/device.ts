/**
 * Device management module for cross-device sync.
 * Handles device registration, identification, and naming.
 */

import { generateId, now } from './storage';
import type { DeviceInfo } from './types';

const DEVICE_ID_KEY = 'vibe-schedule-device-id';
const DEVICE_NAME_KEY = 'vibe-schedule-device-name';

/**
 * Get or create a unique device ID.
 * The device ID is stored in localStorage and persists across sessions.
 * Uses UUID v4 for cross-device sync compatibility.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return empty string (should not be used)
    return '';
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    // Fallback if localStorage fails
    return generateId();
  }
}

/**
 * Get the current device name (user-friendly identifier).
 * Returns null if no name has been set.
 */
export function getDeviceName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(DEVICE_NAME_KEY);
  } catch {
    return null;
  }
}

/**
 * Update the device name.
 * @param name - User-friendly name for this device (max 50 characters)
 */
export function updateDeviceName(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const trimmed = name.trim().slice(0, 50);
    if (trimmed) {
      localStorage.setItem(DEVICE_NAME_KEY, trimmed);
    } else {
      localStorage.removeItem(DEVICE_NAME_KEY);
    }
  } catch {
    console.error('Failed to update device name');
  }
}

/**
 * Get the current device's user agent string.
 */
export function getUserAgent(): string {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return 'Unknown';
  }
  return navigator.userAgent;
}

/**
 * Generate a human-readable device description from user agent.
 * Extracts browser and OS information for display.
 */
export function getDeviceDescription(): string {
  const ua = getUserAgent();

  // Extract OS
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Extract browser
  let browser = 'Unknown Browser';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';

  return `${browser} on ${os}`;
}

/**
 * Build a DeviceInfo object for the current device.
 */
export function buildDeviceInfo(): DeviceInfo {
  return {
    id: getOrCreateDeviceId(),
    name: getDeviceName(),
    userAgent: getUserAgent(),
    lastSeenAt: now(),
    createdAt: now(),
  };
}
