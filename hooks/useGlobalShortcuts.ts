'use client';

import { useEffect, useCallback, useState } from 'react';

export interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

interface UseGlobalShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutAction[];
}

/**
 * Hook for handling global keyboard shortcuts
 * @param options Configuration options including shortcuts and enabled state
 */
export function useGlobalShortcuts({
  enabled = true,
  shortcuts,
}: UseGlobalShortcutsOptions) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if shortcuts are disabled
      if (!enabled) return;

      // Skip if typing in an input or contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        // Allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      // Check for help shortcut (Cmd/Ctrl + /)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase() ||
          e.code.toLowerCase() === shortcut.key.toLowerCase();

        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey);
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        // Handle Cmd/Ctrl shortcuts
        if (shortcut.ctrl || shortcut.meta) {
          if (keyMatch && (e.ctrlKey || e.metaKey) && altMatch && shiftMatch) {
            e.preventDefault();
            shortcut.action();
            return;
          }
        } else if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
    shortcuts,
  };
}

/**
 * Format shortcut for display
 * @param shortcut The shortcut configuration
 * @returns Formatted string like "⌘N" or "Ctrl+N"
 */
export function formatShortcut(shortcut: ShortcutAction): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  // Format special keys
  let keyDisplay = shortcut.key;
  if (keyDisplay === 'ArrowUp') keyDisplay = '↑';
  else if (keyDisplay === 'ArrowDown') keyDisplay = '↓';
  else if (keyDisplay === 'ArrowLeft') keyDisplay = '←';
  else if (keyDisplay === 'ArrowRight') keyDisplay = '→';
  else if (keyDisplay === 'Escape') keyDisplay = 'Esc';
  else if (keyDisplay === 'Enter') keyDisplay = '↵';
  else if (keyDisplay === 'Space') keyDisplay = '␣';
  else if (keyDisplay.length === 1) keyDisplay = keyDisplay.toUpperCase();

  parts.push(keyDisplay);

  return isMac ? parts.join('') : parts.join('+');
}
