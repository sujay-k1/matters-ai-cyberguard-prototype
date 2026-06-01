import { Modal, TextArea } from '@carbon/react';

interface ResponseFailureModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResponseFailureModal({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
}: ResponseFailureModalProps) {
  return (
    <Modal
      open={open}
      modalHeading="Mark action failed"
      primaryButtonText="Save failure"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!value.trim()}
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <TextArea
        id="response-failure-reason"
        labelText="Failure reason"
        rows={4}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Modal>
  );
}
