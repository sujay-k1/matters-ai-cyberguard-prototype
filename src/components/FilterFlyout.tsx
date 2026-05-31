import { Checkbox } from '@carbon/react';
import { Close } from '@carbon/icons-react';
import type { FilterDefinition } from '../types/queue';

interface FilterFlyoutProps {
  filter: FilterDefinition;
  selectedValues: string[];
  focusedValueIndex: number;
  onToggle: (value: string) => void;
  onClose: () => void;
}

export function FilterFlyout({
  filter,
  selectedValues,
  focusedValueIndex,
  onToggle,
  onClose,
}: FilterFlyoutProps) {
  return (
    <aside className="cg-filter-flyout" aria-label={`${filter.label} options`}>
      <header>
        <div>
          <h4>{filter.label}</h4>
          <p>{selectedValues.length} selected</p>
        </div>
        <button type="button" className="cg-icon-action" onClick={onClose} aria-label="Close flyout">
          <Close size={16} />
        </button>
      </header>
      <div className="cg-filter-flyout__content">
        {filter.values.map((value, index) => (
          <div
            key={value}
            className={index === focusedValueIndex ? 'is-focused' : ''}
          >
            <Checkbox
              id={`${filter.id}-${value}`}
              labelText={value}
              checked={selectedValues.includes(value)}
              onChange={() => onToggle(value)}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
