import { Dropdown, Modal, Tag } from '@carbon/react';
import type { WorkItem } from '../types/queue';

interface MergeReviewModalProps {
  open: boolean;
  selectedItems: WorkItem[];
  destinationOptions: WorkItem[];
  destinationCaseId: string | null;
  proposedTitle: string;
  proposedSeverity: string;
  recalculatedPriority: number;
  affectedSystems: string[];
  assignees: string[];
  statuses: string[];
  warnings: string[];
  onDestinationChange: (caseId: string | null) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function MergeReviewModal({
  open,
  selectedItems,
  destinationOptions,
  destinationCaseId,
  proposedTitle,
  proposedSeverity,
  recalculatedPriority,
  affectedSystems,
  assignees,
  statuses,
  warnings,
  onDestinationChange,
  onClose,
  onSubmit,
}: MergeReviewModalProps) {
  return (
    <Modal
      open={open}
      modalHeading="Review consolidation"
      primaryButtonText="Consolidate"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-merge-review">
        <section>
          <h4>Selection</h4>
          <ul>
            {selectedItems.map((item) => (
              <li key={item.id}>
                {item.id} · {item.title}
              </li>
            ))}
          </ul>
        </section>
        {destinationOptions.length > 0 ? (
          <section>
            <Dropdown
              id="destination-case"
              titleText="Destination case"
              label="Select a destination case"
              items={[{ id: '', title: 'Create new case' }, ...destinationOptions.map((item) => ({
                id: item.id,
                title: `${item.id} — ${item.title}`,
              }))]}
              selectedItem={
                [{ id: '', title: 'Create new case' }, ...destinationOptions.map((item) => ({
                  id: item.id,
                  title: `${item.id} — ${item.title}`,
                }))].find((option) => option.id === (destinationCaseId ?? ''))
              }
              itemToString={(item) => item?.title ?? ''}
              onChange={({ selectedItem }) => onDestinationChange(selectedItem?.id || null)}
            />
          </section>
        ) : null}
        <section className="cg-merge-grid">
          <div>
            <h4>Proposed case title</h4>
            <p>{proposedTitle}</p>
          </div>
          <div>
            <h4>Proposed severity</h4>
            <Tag type="red">{proposedSeverity}</Tag>
          </div>
          <div>
            <h4>Recalculated priority score</h4>
            <p>{recalculatedPriority}</p>
          </div>
          <div>
            <h4>Affected systems</h4>
            <p>{affectedSystems.join(', ')}</p>
          </div>
          <div>
            <h4>Existing assignees</h4>
            <p>{assignees.join(', ')}</p>
          </div>
          <div>
            <h4>Existing statuses</h4>
            <p>{statuses.join(', ')}</p>
          </div>
        </section>
        {warnings.length ? (
          <section>
            <h4>Conflict warnings</h4>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
