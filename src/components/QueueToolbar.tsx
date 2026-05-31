import { Button, Dropdown, Search } from '@carbon/react';
import { Column } from '@carbon/icons-react';
import type { QueueSegment, SortOptionId } from '../types/queue';

interface QueueToolbarProps {
  segment: QueueSegment;
  counts: Record<QueueSegment, number>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSegmentChange: (segment: QueueSegment) => void;
  sortOptionId: SortOptionId;
  onSortChange: (id: SortOptionId) => void;
  onOpenColumns: () => void;
}

const sortOptions = [
  { id: 'priority-high', label: 'Priority: Highest first' },
  { id: 'priority-low', label: 'Priority: Lowest first' },
  { id: 'severity-high', label: 'Severity: Highest first' },
  { id: 'sla-urgent', label: 'SLA: Most urgent first' },
  { id: 'last-activity', label: 'Last activity: Most recent first' },
  { id: 'detection-time', label: 'Detection time: Newest first' },
  { id: 'title', label: 'Title: A–Z' },
] satisfies Array<{ id: SortOptionId; label: string }>;

export function QueueToolbar({
  segment,
  counts,
  searchValue,
  onSearchChange,
  onSegmentChange,
  sortOptionId,
  onSortChange,
  onOpenColumns,
}: QueueToolbarProps) {
  return (
    <section className="cg-toolbar" id="queue-toolbar" tabIndex={-1}>
      <div className="cg-toolbar-left">
        <div className="cg-segmented-control" role="tablist" aria-label="Queue segments">
          {(['All', 'Cases', 'Alerts'] as QueueSegment[]).map((entry) => (
            <button
              key={entry}
              className={segment === entry ? 'is-active' : ''}
              type="button"
              onClick={() => onSegmentChange(entry)}
            >
              {entry} {counts[entry]}
            </button>
          ))}
        </div>
        <Search
          id="queue-search"
          labelText="Search cases, alerts, users, or resources"
          placeholder="Search cases, alerts, users, or resources (/)"
          size="md"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="cg-toolbar-right">
        <Dropdown
          id="sort-order"
          label=""
          titleText=""
          selectedItem={sortOptions.find((option) => option.id === sortOptionId)}
          items={sortOptions}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              onSortChange(selectedItem.id);
            }
          }}
        />
        <Button kind="tertiary" renderIcon={Column} onClick={onOpenColumns}>
          Columns
        </Button>
      </div>
    </section>
  );
}
