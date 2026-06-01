import { ComboBox, InlineLoading, Modal } from '@carbon/react';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';
import { InlineStateNotice } from './InlineStateNotice';

interface ResponseApprovalModalProps {
  open: boolean;
  approver: string;
  justification: string;
  approvers: string[];
  heading?: string;
  justificationSuggestion?: string;
  submitting?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onApproverChange: (value: string) => void;
  onJustificationChange: (value: string) => void;
  onJustificationProvenanceChange?: (value: DraftProvenance) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResponseApprovalModal({
  open,
  approver,
  justification,
  approvers,
  heading = 'Request approval',
  justificationSuggestion,
  submitting = false,
  errorMessage,
  onRetry,
  onApproverChange,
  onJustificationChange,
  onJustificationProvenanceChange,
  onClose,
  onSubmit,
}: ResponseApprovalModalProps) {
  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={heading}
      primaryButtonText={submitting ? 'Submitting…' : 'Submit request'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={submitting || !approver.trim() || !justification.trim()}
      selectorPrimaryFocus="#response-approval-justification"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        {submitting ? <InlineLoading description="Routing approval request…" /> : null}
        {errorMessage ? (
          <InlineStateNotice kind="error" title="Approval routing failed." subtitle={errorMessage} actionLabel="Retry" onAction={onRetry} />
        ) : null}
        <ComboBox
          id="response-approver"
          titleText="Approver"
          items={approvers}
          selectedItem={approver}
          itemToString={(item) => item ?? ''}
          onChange={({ selectedItem }) => onApproverChange(selectedItem ?? '')}
        />
        <AISuggestedTextArea
          id="response-approval-justification"
          labelText="Justification"
          placeholder="Add the reason this action should be approved"
          aiSuggestion={justificationSuggestion}
          rows={4}
          value={justification}
          onChange={onJustificationChange}
          onProvenanceChange={onJustificationProvenanceChange}
        />
      </div>
    </Modal>
  );
}
