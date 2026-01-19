// Audio notification utilities for Working Mode

let audioContext: AudioContext | null = null;

/**
 * Get or create the audio context
 * Note: AudioContext creation requires user gesture on first interaction
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
}

/**
 * Play a short chime sound (context time exhausted)
 */
export function playChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Silently fail if audio playback fails
  }
}

/**
 * Play a completion sound (session ended)
 */
export function playCompletion(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Play two ascending notes
    const frequencies = [523.25, 659.25]; // C5, E5
    const times = [0, 0.15];

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + times[i];
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch {
    // Silently fail if audio playback fails
  }
}

/**
 * Resume audio context after user gesture
 * Call this on first user interaction to enable audio
 */
export function initializeAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

// ============================================
// Browser Notification API Support
// ============================================

/**
 * Check if browser notifications are supported
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * Should only be called after a user gesture (e.g., button click)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    console.warn('Failed to request notification permission');
    return 'default';
  }
}

/**
 * Show a browser notification
 * Returns true if the notification was shown, false otherwise
 */
export function showBrowserNotification(
  title: string,
  message: string,
  id: string,
  onClick?: () => void
): boolean {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: message,
      tag: id, // Prevents duplicate notifications with same tag
      requireInteraction: true, // Stays visible until user interacts
      icon: '/favicon.ico',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };

    return true;
  } catch {
    console.warn('Failed to show browser notification');
    return false;
  }
}

/**
 * Play a reminder notification sound
 * Similar to playChime but with a different tone for reminders
 */
export function playReminderSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Play two notes for a gentle reminder sound
    const frequencies = [659.25, 784.0]; // E5, G5
    const times = [0, 0.12];

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + times[i];
      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  } catch {
    // Silently fail if audio playback fails
  }
}
