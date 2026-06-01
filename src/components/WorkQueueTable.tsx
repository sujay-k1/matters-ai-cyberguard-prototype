import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag } from '@carbon/react';
import type { ColumnDefinition, WorkItem } from '../types/queue';
import { InlineStateNotice } from './InlineStateNotice';
import { OperationalState } from './OperationalState';
import { TableLoadingState } from './TableLoadingState';

interface WorkQueueTableProps {
  items: WorkItem[];
  columns: ColumnDefinition[];
  selectedIds: string[];
  previewItemId: string | null;
  loading?: boolean;
  refreshing?: boolean;
  error?: boolean;
  emptyKind?: 'empty' | 'search' | 'filters' | 'preset' | 'segment';
  emptyContext?: string;
  onRetry?: () => void;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  onClearPreset?: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onOpenPreview: (id: string) => void;
}

export function WorkQueueTable({
  items,
  columns,
  selectedIds,
  previewItemId,
  loading = false,
  refreshing = false,
  error = false,
  emptyKind,
  emptyContext,
  onRetry,
  onClearSearch,
  onClearFilters,
  onClearPreset,
  onToggleSelect,
  onToggleSelectAll,
  onOpenPreview,
}: WorkQueueTableProps) {
  const visibleColumns = columns.filter((column) => column.visible);
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const pinnedColumns = visibleColumns.filter((column) => column.pinned);

  if (loading) {
    return (
      <div className="cg-table-shell" id="queue-list" tabIndex={-1}>
        <TableLoadingState columnCount={visibleColumns.length + 1} rowCount={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cg-table-shell" id="queue-list" tabIndex={-1}>
        <OperationalState
          kind="error"
          title="Unable to load work items."
          description="The queue could not be retrieved."
          primaryActionLabel="Retry"
          onPrimaryAction={onRetry}
        />
      </div>
    );
  }

  if (items.length === 0) {
    const emptyConfig = resolveEmptyState(emptyKind, emptyContext);
    return (
      <div className="cg-table-shell" id="queue-list" tabIndex={-1}>
        <OperationalState
          kind={emptyConfig.kind}
          title={emptyConfig.title}
          description={emptyConfig.description}
          primaryActionLabel={emptyConfig.primaryLabel}
          onPrimaryAction={
            emptyKind === 'search'
              ? onClearSearch
              : emptyKind === 'filters'
                ? onClearFilters
                : emptyKind === 'preset'
                  ? onClearPreset
                  : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="cg-table-shell" id="queue-list" tabIndex={-1}>
      {refreshing ? (
        <InlineStateNotice kind="info" title="Refreshing work items" subtitle="Refreshing work items…" />
      ) : null}
      <div className="cg-table-scroll">
        <Table size="sm" useZebraStyles={false}>
          <TableHead>
            <TableRow>
              <TableHeader className="cg-sticky-cell cg-select-column" style={{ left: 0 }}>
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onChange={(_, { checked }) => onToggleSelectAll(Boolean(checked))}
                  labelText=""
                />
              </TableHeader>
              {visibleColumns.map((column, index) => (
                <TableHeader
                  key={column.id}
                  className={[
                    column.pinned ? 'cg-sticky-cell' : '',
                    column.id === pinnedColumns[pinnedColumns.length - 1]?.id ? 'cg-pinned-boundary' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={cellStyle(column, index, visibleColumns)}
                >
                  {column.label}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <TableRow
                  key={item.id}
                  className={[
                    'cg-table-row',
                    previewItemId === item.id ? 'is-previewed' : '',
                    isSelected ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onOpenPreview(item.id)}
                >
                  <TableCell
                    className="cg-sticky-cell cg-select-column"
                    style={{ left: 0 }}
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      id={`select-${item.id}`}
                      checked={isSelected}
                      labelText=""
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => event.stopPropagation()}
                      onChange={() => onToggleSelect(item.id)}
                    />
                  </TableCell>
                  {visibleColumns.map((column, index) => (
                    <TableCell
                      key={`${item.id}-${column.id}`}
                      className={[
                        column.pinned ? 'cg-sticky-cell' : '',
                        column.id === pinnedColumns[pinnedColumns.length - 1]?.id ? 'cg-pinned-boundary' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={cellStyle(column, index, visibleColumns)}
                    >
                      {renderCell(item, column.id)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function resolveEmptyState(
  emptyKind: WorkQueueTableProps['emptyKind'],
  emptyContext?: string,
) {
  if (emptyKind === 'search') {
    return {
      kind: 'no-results' as const,
      title: `No work items match “${emptyContext ?? 'your search'}”.`,
      description: 'Try a broader search or clear the current query.',
      primaryLabel: 'Clear search',
    };
  }
  if (emptyKind === 'filters') {
    return {
      kind: 'no-results' as const,
      title: 'No work items match the current filters.',
      description: 'Clear one or more filters to broaden the queue scope.',
      primaryLabel: 'Clear filters',
    };
  }
  if (emptyKind === 'preset') {
    return {
      kind: 'no-results' as const,
      title: 'No items currently match this Overview preset.',
      description: 'The preset is valid, but nothing in the current queue matches it right now.',
      primaryLabel: 'Clear preset',
    };
  }
  if (emptyKind === 'segment') {
    return {
      kind: 'no-results' as const,
      title: emptyContext === 'Cases' ? 'No cases match the current scope.' : 'No standalone alerts match the current scope.',
      description: 'Adjust the current segment or broaden the queue scope.',
    };
  }
  return {
    kind: 'empty' as const,
    title: 'No alerts or cases require attention.',
    description: 'New work items will appear here when risks are detected.',
  };
}

function cellStyle(column: ColumnDefinition, index: number, columns: ColumnDefinition[]) {
  const base = {
    width: `${column.width}px`,
    minWidth: `${column.width}px`,
    maxWidth: `${column.width}px`,
  };
  if (!column.pinned) {
    return base;
  }
  return {
    ...base,
    left: stickyLeft(index, columns),
  };
}

function renderCell(item: WorkItem, columnId: string) {
  switch (columnId) {
    case 'type':
      return <Tag type={item.item_type === 'case' ? 'purple' : 'cyan'}>{item.item_type === 'case' ? 'Case' : 'Alert'}</Tag>;
    case 'priority':
      return item.priority;
    case 'severity':
      return <Tag type={severityTagType(item.severity)}>{item.severity}</Tag>;
    case 'title':
      return (
        <div className="cg-title-cell">
          <span>{item.title}</span>
          {item.item_type === 'case' && item.alert_count ? <small>{item.alert_count} alerts</small> : null}
        </div>
      );
    case 'affected_systems':
      return item.affected_systems.join(', ');
    case 'risk_type':
      return item.risk_type;
    case 'data_sensitivity':
      return item.data_sensitivity;
    case 'status':
      return <Tag type="gray">{item.status}</Tag>;
    case 'assignee':
      return item.assignee;
    case 'sla':
      return item.sla;
    case 'last_activity':
      return item.last_activity;
    case 'alert_count':
      return item.alert_count ?? '—';
    case 'id':
      return <span className="cg-mono">{item.id}</span>;
    case 'key_resource':
      return item.key_resource;
    case 'primary_actor':
      return item.primary_actor;
    case 'detection_time':
      return item.detection_time;
    case 'containment':
      return item.containment;
    case 'detection_source':
      return item.detection_source;
    default:
      return '';
  }
}

function stickyLeft(index: number, columns: ColumnDefinition[]) {
  let left = 64;
  for (let current = 0; current < index; current += 1) {
    if (columns[current].pinned && columns[current].visible) {
      left += columns[current].width;
    }
  }
  return left;
}

function severityTagType(severity: string) {
  if (severity === 'Critical') return 'red';
  if (severity === 'High') return 'magenta';
  if (severity === 'Medium') return 'blue';
  return 'gray';
}
