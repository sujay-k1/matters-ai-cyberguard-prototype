import { Modal, TextArea } from '@carbon/react';
import { useEffect } from 'react';

interface InvestigationNoteModalProps {
  open: boolean;
  value: string;
  textAreaId?: string;
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
  textAreaId = 'investigation-note',
  title = 'Add note',
  primaryButtonText = 'Save note',
  labelText = 'Note',
  placeholder = 'Capture analyst context, evidence decisions, or handoff details',
  onChange,
  onClose,
  onSubmit,
}: InvestigationNoteModalProps) {
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(textAreaId) as HTMLTextAreaElement | null;
      element?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, textAreaId]);

  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={title}
      selectorPrimaryFocus={`#${textAreaId}`}
      primaryButtonText={primaryButtonText}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!value.trim()}
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <TextArea
        id={textAreaId}
        labelText={labelText}
        placeholder={placeholder}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Modal>
  );
}
