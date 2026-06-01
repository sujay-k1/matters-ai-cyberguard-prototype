import { Dropdown, Modal, Tag } from '@carbon/react';
import type { WorkItem } from '../types/queue';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';

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
  proposedStatus: string;
  warnings: string[];
  requiresReopenComment: boolean;
  reopenComment: string;
  onReopenCommentChange: (value: string) => void;
  onReopenCommentProvenanceChange?: (value: DraftProvenance) => void;
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
  proposedStatus,
  warnings,
  requiresReopenComment,
  reopenComment,
  onReopenCommentChange,
  onReopenCommentProvenanceChange,
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
      primaryButtonDisabled={requiresReopenComment && !reopenComment.trim()}
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
            <p className="cg-summary-line">AI suggested</p>
            <p>{proposedTitle}</p>
          </div>
          <div>
            <h4>Proposed severity</h4>
            <p className="cg-summary-line">System-derived</p>
            <Tag type="red">{proposedSeverity}</Tag>
          </div>
          <div>
            <h4>Recalculated priority score</h4>
            <p className="cg-summary-line">System-derived</p>
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
          <div>
            <h4>Proposed merged status</h4>
            <p className="cg-summary-line">System-derived</p>
            <p>{proposedStatus}</p>
          </div>
        </section>
        {requiresReopenComment ? (
          <section>
            <h4>Reopen comment</h4>
            <AISuggestedTextArea
              id="merge-reopen-comment"
              labelText="Why are you reopening this item?"
              placeholder="Add the required reopening comment"
              aiSuggestion={`Reopen ${destinationCaseId ?? 'the destination case'} so the merged alerts can be reviewed together under the updated case scope and workflow state.`}
              rows={4}
              value={reopenComment}
              onChange={onReopenCommentChange}
              onProvenanceChange={onReopenCommentProvenanceChange}
            />
          </section>
        ) : null}
        {warnings.length ? (
          <section>
            <h4>Conflict warnings</h4>
            <p className="cg-summary-line">System guardrail</p>
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
