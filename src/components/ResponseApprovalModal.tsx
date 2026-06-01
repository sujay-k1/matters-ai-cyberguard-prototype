import { ComboBox, Modal } from '@carbon/react';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';

interface ResponseApprovalModalProps {
  open: boolean;
  approver: string;
  justification: string;
  approvers: string[];
  heading?: string;
  justificationSuggestion?: string;
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
      primaryButtonText="Submit request"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!approver.trim() || !justification.trim()}
      selectorPrimaryFocus="#response-approval-justification"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
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
