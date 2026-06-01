import { Modal } from '@carbon/react';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';

interface ResponseRejectModalProps {
  open: boolean;
  value: string;
  heading?: string;
  label?: string;
  primaryButtonText?: string;
  commentSuggestion?: string;
  onChange: (value: string) => void;
  onCommentProvenanceChange?: (value: DraftProvenance) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResponseRejectModal({
  open,
  value,
  heading = 'Reject action',
  label = 'Comment',
  primaryButtonText = 'Reject',
  commentSuggestion,
  onChange,
  onCommentProvenanceChange,
  onClose,
  onSubmit,
}: ResponseRejectModalProps) {
  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={heading}
      primaryButtonText={primaryButtonText}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!value.trim()}
      selectorPrimaryFocus="#response-reject-comment"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <AISuggestedTextArea
        id="response-reject-comment"
        labelText={label}
        placeholder={`Add ${label.toLowerCase()}`}
        aiSuggestion={commentSuggestion}
        rows={4}
        value={value}
        onChange={onChange}
        onProvenanceChange={onCommentProvenanceChange}
      />
    </Modal>
  );
}
