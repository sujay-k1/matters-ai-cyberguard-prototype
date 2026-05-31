import { useEffect, useRef } from 'react';

interface ShortcutHandlers {
  isFilterModeActive: boolean;
  onFocusQueueSearch: () => void;
  onOpenShortcutGuide: () => void;
  onFocusFilters: () => void;
  onFocusToolbar: () => void;
  onFocusList: () => void;
  onFocusPagination: () => void;
  onEscape: () => void;
  onFilterModeKey: (key: string, event: KeyboardEvent) => boolean;
}

export function useKeyboardShortcuts({
  isFilterModeActive,
  onFocusQueueSearch,
  onOpenShortcutGuide,
  onFocusFilters,
  onFocusToolbar,
  onFocusList,
  onFocusPagination,
  onEscape,
  onFilterModeKey,
}: ShortcutHandlers) {
  const prefixRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPrefix = () => {
      prefixRef.current = null;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const setPrefix = (value: string) => {
      prefixRef.current = value;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        clearPrefix();
      }, 1200);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTypingTarget =
        tagName === 'input' || tagName === 'textarea' || target?.isContentEditable;

      if (event.key === 'Escape') {
        event.preventDefault();
        clearPrefix();
        onEscape();
        return;
      }

      if (isFilterModeActive && onFilterModeKey(event.key, event)) {
        return;
      }

      if (event.key === '?' && !isTypingTarget) {
        event.preventDefault();
        onOpenShortcutGuide();
        return;
      }

      if (event.key === '/' && !isTypingTarget) {
        event.preventDefault();
        clearPrefix();
        onFocusQueueSearch();
        return;
      }

      if (prefixRef.current === 'g') {
        const key = event.key.toLowerCase();
        clearPrefix();
        if (key === 'f') {
          event.preventDefault();
          onFocusFilters();
        } else if (key === 't') {
          event.preventDefault();
          onFocusToolbar();
        } else if (key === 'l') {
          event.preventDefault();
          onFocusList();
        } else if (key === 'p') {
          event.preventDefault();
          onFocusPagination();
        }
        return;
      }

      if (!isTypingTarget && event.key.toLowerCase() === 'g') {
        setPrefix('g');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearPrefix();
    };
  }, [
    isFilterModeActive,
    onEscape,
    onFilterModeKey,
    onFocusFilters,
    onFocusList,
    onFocusPagination,
    onFocusQueueSearch,
    onFocusToolbar,
    onOpenShortcutGuide,
  ]);
}
