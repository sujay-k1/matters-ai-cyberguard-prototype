import { Checkbox, Modal, Search } from '@carbon/react';
import { useMemo, useState } from 'react';
import type { HuntResult } from '../types/investigation';

interface HuntResultsModalProps {
  open: boolean;
  results: HuntResult[];
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
  onClose: () => void;
  onAttachSelected: () => void;
}

export function HuntResultsModal({
  open,
  results,
  selectedIds,
  onToggleSelected,
  onClose,
  onAttachSelected,
}: HuntResultsModalProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () =>
      results.filter((result) =>
        `${result.type} ${result.title} ${result.description} ${result.sourceSystem} ${result.entity}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [results, search],
  );

  return (
    <Modal
      open={open}
      modalHeading="Hunt results"
      primaryButtonText="Attach selected to case"
      secondaryButtonText="Close"
      primaryButtonDisabled={selectedIds.length === 0}
      onRequestClose={onClose}
      onRequestSubmit={onAttachSelected}
    >
      <div className="cg-dialog-stack">
        <Search id="hunt-result-search" labelText="Search hunt results" placeholder="Search hunt results" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
        <div className="cg-hunt-results-list">
          {filtered.map((result) => (
            <label key={result.id} className="cg-hunt-result-row">
              <Checkbox id={`hunt-${result.id}`} labelText="" checked={selectedIds.includes(result.id)} onChange={() => onToggleSelected(result.id)} />
              <div>
                <strong>{result.title}</strong>
                <p>{result.description}</p>
                <span>{result.sourceSystem} · {result.entity} · {result.timestamp}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}
