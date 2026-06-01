import { Button, Dropdown } from '@carbon/react';

interface QueuePaginationProps {
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const pageSizes = [
  { id: '25', label: '25' },
  { id: '50', label: '50' },
  { id: '100', label: '100' },
];

export function QueuePagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: QueuePaginationProps) {
  if (totalItems === 0) {
    return null;
  }
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <footer className="cg-pagination" id="queue-pagination" tabIndex={-1}>
      <span>
        {start}–{end} of {totalItems} items
      </span>
      <div className="cg-pagination__controls">
        <Dropdown
          id="page-size"
          label=""
          titleText=""
          direction="top"
          items={pageSizes}
          selectedItem={pageSizes.find((option) => option.id === String(pageSize))}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              onPageSizeChange(Number(selectedItem.id));
            }
          }}
        />
        <Button kind="ghost" size="sm" onClick={() => onPageChange(1)} disabled={page === 1}>
          First
        </Button>
        <Button kind="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          kind="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
        <Button
          kind="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </Button>
      </div>
    </footer>
  );
}
