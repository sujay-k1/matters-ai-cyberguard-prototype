import { Button } from '@carbon/react';

interface BulkActionBarProps {
  selectedCount: number;
  onAssign: () => void;
  onStatus: () => void;
  onConsolidate: () => void;
  onAddTag: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedCount,
  onAssign,
  onStatus,
  onConsolidate,
  onAddTag,
  onClear,
}: BulkActionBarProps) {
  return (
    <div className="cg-bulk-bar">
      <strong>{selectedCount} items selected</strong>
      <div>
        <Button kind="ghost" size="sm" onClick={onAssign}>
          Assign
        </Button>
        <Button kind="ghost" size="sm" onClick={onStatus}>
          Change status
        </Button>
        <Button kind="secondary" size="sm" onClick={onConsolidate}>
          Consolidate into case
        </Button>
        <Button kind="ghost" size="sm" onClick={onAddTag}>
          Add tag
        </Button>
        <Button kind="danger--ghost" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}
