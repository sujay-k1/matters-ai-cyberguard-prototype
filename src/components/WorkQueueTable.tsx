import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag } from '@carbon/react';
import type { ColumnDefinition, WorkItem } from '../types/queue';

interface WorkQueueTableProps {
  items: WorkItem[];
  columns: ColumnDefinition[];
  selectedIds: string[];
  previewItemId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onOpenPreview: (id: string) => void;
}

export function WorkQueueTable({
  items,
  columns,
  selectedIds,
  previewItemId,
  onToggleSelect,
  onToggleSelectAll,
  onOpenPreview,
}: WorkQueueTableProps) {
  const visibleColumns = columns.filter((column) => column.visible);
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  return (
    <div className="cg-table-shell" id="queue-list">
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
                  className={column.pinned ? 'cg-sticky-cell' : ''}
                  style={column.pinned ? { left: stickyLeft(index, visibleColumns) } : { minWidth: column.width }}
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
                  <TableCell className="cg-sticky-cell cg-select-column" style={{ left: 0 }}>
                    <Checkbox
                      id={`select-${item.id}`}
                      checked={isSelected}
                      labelText=""
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => onToggleSelect(item.id)}
                    />
                  </TableCell>
                  {visibleColumns.map((column, index) => (
                    <TableCell
                      key={`${item.id}-${column.id}`}
                      className={column.pinned ? 'cg-sticky-cell' : ''}
                      style={column.pinned ? { left: stickyLeft(index, visibleColumns) } : { minWidth: column.width }}
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
