import { Modal, TextArea } from '@carbon/react';

interface InvestigationNoteModalProps {
  open: boolean;
  value: string;
  title?: string;
  primaryButtonText?: string;
  labelText?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function InvestigationNoteModal({
  open,
  value,
  title = 'Add note',
  primaryButtonText = 'Save note',
  labelText = 'Note',
  placeholder = 'Capture analyst context, evidence decisions, or handoff details',
  onChange,
  onClose,
  onSubmit,
}: InvestigationNoteModalProps) {
  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={title}
      primaryButtonText={primaryButtonText}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!value.trim()}
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <TextArea
        id="investigation-note"
        labelText={labelText}
        placeholder={placeholder}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Modal>
  );
}
