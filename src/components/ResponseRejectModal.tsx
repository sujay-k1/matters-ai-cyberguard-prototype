import { Modal, TextArea } from '@carbon/react';

interface ResponseRejectModalProps {
  open: boolean;
  value: string;
  heading?: string;
  label?: string;
  primaryButtonText?: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResponseRejectModal({
  open,
  value,
  heading = 'Reject action',
  label = 'Comment',
  primaryButtonText = 'Reject',
  onChange,
  onClose,
  onSubmit,
}: ResponseRejectModalProps) {
  return (
    <Modal
      open={open}
      modalHeading={heading}
      primaryButtonText={primaryButtonText}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!value.trim()}
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <TextArea
        id="response-reject-comment"
        labelText={label}
        rows={4}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Modal>
  );
}
