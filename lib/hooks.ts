'use client';

import { useEffect, RefObject } from 'react';

/**
 * Hook that detects clicks outside of specified elements
 * @param refs - Array of refs to elements that should be considered "inside"
 * @param handler - Callback to run when a click outside is detected
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // Check if click is inside any of the refs
      const isInside = refs.some(
        (ref) => ref.current && ref.current.contains(event.target as Node)
      );
      if (!isInside) {
        handler();
      }
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [refs, handler]);
}
