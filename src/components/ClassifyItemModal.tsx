import { Checkbox, Dropdown, Modal, TextInput, TextArea } from '@carbon/react';
import type { WorkItemClassification } from '../types/investigation';

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
  onClassificationChange: (value: WorkItemClassification) => void;
  onCommentChange: (value: string) => void;
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
    onClassificationChange,
    onCommentChange,
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
      primaryButtonText="Save classification"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!comment.trim()}
      selectorPrimaryFocus="#classification-comment"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        <Dropdown
          id="classification-select"
          titleText="Classification"
          label="Select classification"
          items={CLASSIFICATIONS.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={{ id: classification, label: classification }}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => selectedItem && onClassificationChange(selectedItem.id as WorkItemClassification)}
        />
        <TextArea
          id="classification-comment"
          labelText="Analyst comment"
          rows={4}
          value={comment}
          onChange={(event) => onCommentChange(event.currentTarget.value)}
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
