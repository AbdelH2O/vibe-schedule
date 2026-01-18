'use client';

import { useCallback, useState, useRef, useEffect } from 'react';

interface UseListKeyboardNavigationOptions<T> {
  items: T[];
  onSelect?: (item: T, index: number) => void;
  onActivate?: (item: T, index: number) => void;
  getItemId?: (item: T) => string;
  enabled?: boolean;
  loop?: boolean;
  typeahead?: boolean;
  typeaheadTimeout?: number;
}

interface UseListKeyboardNavigationReturn<T> {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  selectedItem: T | null;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  getItemProps: (item: T, index: number) => {
    role: string;
    tabIndex: number;
    'aria-selected': boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onClick: () => void;
  };
  containerProps: {
    role: string;
    'aria-activedescendant': string | undefined;
  };
}

/**
 * Hook for keyboard navigation in lists
 * Implements roving tabindex pattern with arrow key navigation
 */
export function useListKeyboardNavigation<T>({
  items,
  onSelect,
  onActivate,
  getItemId,
  enabled = true,
  loop = true,
  typeahead = false,
  typeaheadTimeout = 500,
}: UseListKeyboardNavigationOptions<T>): UseListKeyboardNavigationReturn<T> {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const typeaheadBuffer = useRef('');
  const typeaheadTimer = useRef<NodeJS.Timeout | null>(null);

  // Clear typeahead buffer after timeout
  useEffect(() => {
    return () => {
      if (typeaheadTimer.current) {
        clearTimeout(typeaheadTimer.current);
      }
    };
  }, []);

  const selectedItem = selectedIndex >= 0 && selectedIndex < items.length
    ? items[selectedIndex]
    : null;

  const selectIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        setSelectedIndex(index);
        onSelect?.(items[index], index);
      }
    },
    [items, onSelect]
  );

  const activateItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        onActivate?.(items[index], index);
      }
    },
    [items, onActivate]
  );

  const handleTypeahead = useCallback(
    (char: string) => {
      if (!typeahead) return false;

      // Clear previous timer
      if (typeaheadTimer.current) {
        clearTimeout(typeaheadTimer.current);
      }

      // Add character to buffer
      typeaheadBuffer.current += char.toLowerCase();

      // Set timer to clear buffer
      typeaheadTimer.current = setTimeout(() => {
        typeaheadBuffer.current = '';
      }, typeaheadTimeout);

      // Find matching item (starting from current selection)
      const searchStart = selectedIndex >= 0 ? selectedIndex + 1 : 0;
      const searchStr = typeaheadBuffer.current;

      // Search from current position to end
      for (let i = searchStart; i < items.length; i++) {
        const itemStr = String(getItemId?.(items[i]) ?? items[i]).toLowerCase();
        if (itemStr.startsWith(searchStr)) {
          selectIndex(i);
          return true;
        }
      }

      // Wrap around and search from beginning
      for (let i = 0; i < searchStart; i++) {
        const itemStr = String(getItemId?.(items[i]) ?? items[i]).toLowerCase();
        if (itemStr.startsWith(searchStr)) {
          selectIndex(i);
          return true;
        }
      }

      return false;
    },
    [typeahead, typeaheadTimeout, selectedIndex, items, getItemId, selectIndex]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled || items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'j': {
          e.preventDefault();
          const nextIndex = selectedIndex < items.length - 1
            ? selectedIndex + 1
            : loop ? 0 : selectedIndex;
          selectIndex(nextIndex);
          break;
        }
        case 'ArrowUp':
        case 'k': {
          e.preventDefault();
          const prevIndex = selectedIndex > 0
            ? selectedIndex - 1
            : loop ? items.length - 1 : selectedIndex;
          selectIndex(prevIndex);
          break;
        }
        case 'Home': {
          e.preventDefault();
          selectIndex(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          selectIndex(items.length - 1);
          break;
        }
        case 'Enter':
        case ' ': {
          if (selectedIndex >= 0) {
            e.preventDefault();
            activateItem(selectedIndex);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setSelectedIndex(-1);
          break;
        }
        default: {
          // Handle typeahead for printable characters
          if (typeahead && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (handleTypeahead(e.key)) {
              e.preventDefault();
            }
          }
        }
      }
    },
    [enabled, items.length, selectedIndex, loop, selectIndex, activateItem, typeahead, handleTypeahead]
  );

  const getItemProps = useCallback(
    (item: T, index: number) => ({
      role: 'option' as const,
      tabIndex: index === selectedIndex ? 0 : -1,
      'aria-selected': index === selectedIndex,
      onKeyDown: handleKeyDown,
      onClick: () => {
        selectIndex(index);
        activateItem(index);
      },
    }),
    [selectedIndex, handleKeyDown, selectIndex, activateItem]
  );

  const containerProps = {
    role: 'listbox' as const,
    'aria-activedescendant': selectedItem && getItemId
      ? getItemId(selectedItem)
      : undefined,
  };

  return {
    selectedIndex,
    setSelectedIndex,
    selectedItem,
    handleKeyDown,
    getItemProps,
    containerProps,
  };
}
