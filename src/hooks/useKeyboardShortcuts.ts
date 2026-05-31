import { useEffect, useRef } from 'react';

interface ShortcutHandlers {
  isFilterModeActive: boolean;
  onToggleShortcutOverlays: () => void;
  onFocusQueueSearch: () => void;
  onFocusFilterSearch: () => void;
  onOpenShortcutGuide: () => void;
  onFocusFilters: () => void;
  onFocusToolbar: () => void;
  onFocusList: () => void;
  onFocusPagination: () => void;
  onFocusPreview: () => void;
  onFocusBulkActions: () => void;
  onEscape: () => void;
  onFilterModeKey: (key: string, event: KeyboardEvent) => boolean;
}

export function useKeyboardShortcuts({
  isFilterModeActive,
  onToggleShortcutOverlays,
  onFocusQueueSearch,
  onFocusFilterSearch,
  onOpenShortcutGuide,
  onFocusFilters,
  onFocusToolbar,
  onFocusList,
  onFocusPagination,
  onFocusPreview,
  onFocusBulkActions,
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

      if (!isTypingTarget && event.key === 'Alt') {
        event.preventDefault();
        clearPrefix();
        onToggleShortcutOverlays();
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

      if (!isTypingTarget && event.shiftKey) {
        const key = event.key.toLowerCase();
        if (key === 'f') {
          event.preventDefault();
          clearPrefix();
          onFocusFilterSearch();
          return;
        }
        if (key === 's') {
          event.preventDefault();
          clearPrefix();
          onFocusQueueSearch();
          return;
        }
        if (key === 'l') {
          event.preventDefault();
          clearPrefix();
          onFocusList();
          return;
        }
        if (key === 'p') {
          event.preventDefault();
          clearPrefix();
          onFocusPreview();
          return;
        }
        if (key === 'b') {
          event.preventDefault();
          clearPrefix();
          onFocusBulkActions();
          return;
        }
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
    onToggleShortcutOverlays,
    onFocusBulkActions,
    onFocusFilterSearch,
    onEscape,
    onFilterModeKey,
    onFocusFilters,
    onFocusList,
    onFocusPagination,
    onFocusPreview,
    onFocusQueueSearch,
    onFocusToolbar,
    onOpenShortcutGuide,
  ]);
}
