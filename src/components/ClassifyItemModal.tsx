import { Checkbox, Dropdown, InlineLoading, Modal, TextInput } from '@carbon/react';
import type { WorkItemClassification } from '../types/investigation';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';
import { InlineStateNotice } from './InlineStateNotice';

const CLASSIFICATIONS: WorkItemClassification[] = [
  'True positive — malicious activity',
  'True positive — policy violation',
  'Expected business activity',
  'False positive',
  'Duplicate',
  'Accepted risk',
  'Needs monitoring',
];

interface ClassifyItemModalProps {
  open: boolean;
  itemId: string | null;
  classification: WorkItemClassification;
  comment: string;
  duplicateCaseId: string;
  exceptionOwner: string;
  createTuningFeedback: boolean;
  commentSuggestion?: string;
  submitting?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onClassificationChange: (value: WorkItemClassification) => void;
  onCommentChange: (value: string) => void;
  onCommentProvenanceChange?: (value: DraftProvenance) => void;
  onDuplicateCaseIdChange: (value: string) => void;
  onExceptionOwnerChange: (value: string) => void;
  onCreateTuningFeedbackChange: (checked: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ClassifyItemModal(props: ClassifyItemModalProps) {
  const {
    open,
    itemId,
    classification,
    comment,
    duplicateCaseId,
    exceptionOwner,
    createTuningFeedback,
    commentSuggestion,
    submitting = false,
    errorMessage,
    onRetry,
    onClassificationChange,
    onCommentChange,
    onCommentProvenanceChange,
    onDuplicateCaseIdChange,
    onExceptionOwnerChange,
    onCreateTuningFeedbackChange,
    onClose,
    onSubmit,
  } = props;

  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={itemId ? `Classify ${itemId}` : 'Classify item'}
      primaryButtonText={submitting ? 'Saving…' : 'Save classification'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={submitting || !comment.trim()}
      selectorPrimaryFocus="#classification-comment"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        {submitting ? <InlineLoading description="Saving classification…" /> : null}
        {errorMessage ? (
          <InlineStateNotice kind="error" title="Classification could not be saved." subtitle={errorMessage} actionLabel="Retry" onAction={onRetry} />
        ) : null}
        <Dropdown
          id="classification-select"
          titleText="Classification"
          label="Select classification"
          items={CLASSIFICATIONS.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: classification, label: classification }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => selectedItem && onClassificationChange(selectedItem.id as WorkItemClassification)}
        />
        <AISuggestedTextArea
          id="classification-comment"
          labelText="Analyst comment"
          placeholder="Summarize why this classification fits the current evidence"
          aiSuggestion={commentSuggestion}
          rows={4}
          value={comment}
          onChange={onCommentChange}
          onProvenanceChange={onCommentProvenanceChange}
        />
        {classification === 'Duplicate' ? (
          <TextInput
            id="classification-duplicate-case"
            labelText="Related case ID"
            value={duplicateCaseId}
            onChange={(event) => onDuplicateCaseIdChange(event.currentTarget.value)}
          />
        ) : null}
        {classification === 'Accepted risk' ? (
          <TextInput
            id="classification-exception-owner"
            labelText="Exception owner"
            value={exceptionOwner}
            onChange={(event) => onExceptionOwnerChange(event.currentTarget.value)}
          />
        ) : null}
        {classification === 'False positive' ? (
          <Checkbox
            id="classification-feedback"
            labelText="Create detection-tuning feedback"
            checked={createTuningFeedback}
            onChange={(_, { checked }) => onCreateTuningFeedbackChange(Boolean(checked))}
          />
        ) : null}
      </div>
    </Modal>
  );
}
