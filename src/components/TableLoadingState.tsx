import { DataTableSkeleton } from '@carbon/react';

interface TableLoadingStateProps {
  columnCount?: number;
  rowCount?: number;
  compact?: boolean;
}

export function TableLoadingState({
  columnCount = 6,
  rowCount = 6,
  compact = false,
}: TableLoadingStateProps) {
  return (
    <div className={['cg-table-loading-state', compact ? 'is-compact' : ''].filter(Boolean).join(' ')}>
      <DataTableSkeleton columnCount={columnCount} rowCount={rowCount} showHeader={false} showToolbar={false} zebra={false} />
    </div>
  );
}
