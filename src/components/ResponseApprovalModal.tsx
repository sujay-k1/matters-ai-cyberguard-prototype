import { ComboBox, Modal, TextArea } from '@carbon/react';

interface ResponseApprovalModalProps {
  open: boolean;
  approver: string;
  justification: string;
  approvers: string[];
  heading?: string;
  onApproverChange: (value: string) => void;
  onJustificationChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResponseApprovalModal({
  open,
  approver,
  justification,
  approvers,
  heading = 'Request approval',
  onApproverChange,
  onJustificationChange,
  onClose,
  onSubmit,
}: ResponseApprovalModalProps) {
  return (
    <Modal
      open={open}
      modalHeading={heading}
      primaryButtonText="Submit request"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!approver.trim() || !justification.trim()}
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
        <TextArea
          id="response-approval-justification"
          labelText="Justification"
          rows={4}
          value={justification}
          onChange={(event) => onJustificationChange(event.currentTarget.value)}
        />
      </div>
    </Modal>
  );
}
