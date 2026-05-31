import { useEffect, useRef } from 'react';
import { Search, Tag } from '@carbon/react';
import { ChevronRight, Close } from '@carbon/icons-react';
import type { FilterSection } from '../types/queue';
import { FilterFlyout } from './FilterFlyout';

interface FilterPanelProps {
  sections: FilterSection[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedFilters: Record<string, string[]>;
  activeFilterId: string | null;
  filterModeActive: boolean;
  focusedFilterId: string | null;
  focusedValueIndex: number;
  onOpenFilter: (filterId: string, pinned: boolean) => void;
  onCloseFilter: () => void;
  onToggleValue: (filterId: string, value: string) => void;
  onRemoveValue: (filterId: string, value: string) => void;
  onClearAll: () => void;
  shortcutLabelForIndex: (index: number) => string;
  activeFilterPinned: boolean;
  onHoverExit: () => void;
}

export function FilterPanel({
  sections,
  searchValue,
  onSearchChange,
  selectedFilters,
  activeFilterId,
  filterModeActive,
  focusedFilterId,
  focusedValueIndex,
  onOpenFilter,
  onCloseFilter,
  onToggleValue,
  onRemoveValue,
  onClearAll,
  shortcutLabelForIndex,
  activeFilterPinned,
  onHoverExit,
}: FilterPanelProps) {
  const flattened = sections.flatMap((section) =>
    section.filters.map((filter) => ({ ...filter, section: section.section })),
  );
  const visibleIds = new Set(flattened.map((filter) => filter.id));
  const activeFilter = flattened.find((filter) => filter.id === activeFilterId) ?? null;
  const activeSelections = Object.values(selectedFilters).flat().length;
  const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  let visibleFilterCounter = 0;

  useEffect(() => {
    if (focusedFilterId && !activeFilterId) {
      filterButtonRefs.current[focusedFilterId]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeFilterId, focusedFilterId]);

  return (
    <section
      className="cg-filter-panel"
      id="filters-panel"
      tabIndex={-1}
      onMouseLeave={() => {
        if (!activeFilterPinned) {
          onHoverExit();
        }
      }}
    >
      <div className="cg-filter-panel__header">
        <Search
          id="filter-search"
          labelText="Search filters"
          placeholder="Search filters... (Shift+F)"
          size="sm"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {activeSelections > 0 ? (
          <button type="button" className="cg-clear-link" onClick={onClearAll}>
            Clear all filters
          </button>
        ) : null}
      </div>
      <div className="cg-filter-panel__sections">
        {sections.map((section) => {
          const visibleFilters = section.filters.filter((filter) => visibleIds.has(filter.id));
          if (visibleFilters.length === 0) {
            return null;
          }

          return (
            <div key={section.section} className="cg-filter-group">
              <h3>{section.section}</h3>
              <ul>
                {visibleFilters.map((filter) => {
                  const currentIndex = visibleFilterCounter;
                  visibleFilterCounter += 1;
                  const isFocused = focusedFilterId === filter.id;
                  const selection = selectedFilters[filter.id] ?? [];
                  return (
                    <li key={filter.id}>
                      <button
                        ref={(element) => {
                          filterButtonRefs.current[filter.id] = element;
                        }}
                        type="button"
                        className={[
                          'cg-filter-button',
                          activeFilterId === filter.id ? 'is-open' : '',
                          isFocused ? 'is-focused' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onMouseEnter={() => onOpenFilter(filter.id, false)}
                        onClick={() => onOpenFilter(filter.id, true)}
                      >
                        <div>
                          <span>{filter.label}</span>
                          {filterModeActive ? (
                            <small className="cg-shortcut-pill">{shortcutLabelForIndex(currentIndex)}</small>
                          ) : null}
                        </div>
                        <ChevronRight size={16} />
                      </button>
                      {selection.length > 0 ? (
                        <div className="cg-filter-tags">
                          {selection.map((value) => (
                            <Tag key={value} type="gray">
                              <span>{value}</span>
                              <button type="button" onClick={() => onRemoveValue(filter.id, value)}>
                                <Close size={10} />
                              </button>
                            </Tag>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      {activeFilter ? (
        <FilterFlyout
          filter={activeFilter}
          selectedValues={selectedFilters[activeFilter.id] ?? []}
          focusedValueIndex={focusedValueIndex}
          onToggle={(value) => onToggleValue(activeFilter.id, value)}
          onClose={onCloseFilter}
        />
      ) : null}
    </section>
  );
}
