import { Modal } from '@carbon/react';
import { useEffect } from 'react';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';

interface InvestigationNoteModalProps {
  open: boolean;
  value: string;
  textAreaId?: string;
  title?: string;
  primaryButtonText?: string;
  labelText?: string;
  placeholder?: string;
  aiSuggestion?: string;
  helperText?: string;
  onChange: (value: string) => void;
  onDraftProvenanceChange?: (value: DraftProvenance) => void;
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
  aiSuggestion,
  helperText,
  onChange,
  onDraftProvenanceChange,
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
      <AISuggestedTextArea
        id={textAreaId}
        labelText={labelText}
        placeholder={placeholder}
        aiSuggestion={aiSuggestion}
        helperText={helperText}
        rows={5}
        value={value}
        onChange={onChange}
        onProvenanceChange={onDraftProvenanceChange}
      />
    </Modal>
  );
}
