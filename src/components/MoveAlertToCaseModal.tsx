import { Dropdown, InlineLoading, Modal, TextInput } from '@carbon/react';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';
import { InlineStateNotice } from './InlineStateNotice';

interface MoveAlertToCaseModalProps {
  open: boolean;
  alertId: string;
  currentCaseLabel: string;
  destinationCaseId: string;
  reason: string;
  destinationOptions: Array<{ id: string; label: string }>;
  reasonSuggestion?: string;
  submitting?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onDestinationChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onReasonProvenanceChange?: (value: DraftProvenance) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function MoveAlertToCaseModal({
  open,
  alertId,
  currentCaseLabel,
  destinationCaseId,
  reason,
  destinationOptions,
  reasonSuggestion,
  submitting = false,
  errorMessage,
  onRetry,
  onDestinationChange,
  onReasonChange,
  onReasonProvenanceChange,
  onClose,
  onSubmit,
}: MoveAlertToCaseModalProps) {
  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading="Move alert to another case"
      primaryButtonText={submitting ? 'Moving alert…' : 'Move alert'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={submitting || !destinationCaseId || !reason.trim()}
      selectorPrimaryFocus="#move-alert-reason"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        {submitting ? <InlineLoading description="Moving alert…" /> : null}
        {errorMessage ? (
          <InlineStateNotice kind="error" title="Alert move failed." subtitle={errorMessage} actionLabel="Retry" onAction={onRetry} />
        ) : null}
        <TextInput id="move-alert-id" labelText="Alert ID" value={alertId} readOnly />
        <TextInput id="move-alert-current-case" labelText="Current case" value={currentCaseLabel} readOnly />
        <Dropdown
          id="move-alert-destination-case"
          titleText="Destination case"
          label="Select destination case"
          items={destinationOptions}
          selectedItem={destinationOptions.find((option) => option.id === destinationCaseId) ?? null}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => onDestinationChange(selectedItem?.id ?? '')}
        />
        <AISuggestedTextArea
          id="move-alert-reason"
          labelText="Reason"
          placeholder="Explain why the alert should move to another case"
          aiSuggestion={reasonSuggestion}
          rows={4}
          value={reason}
          onChange={onReasonChange}
          onProvenanceChange={onReasonProvenanceChange}
        />
      </div>
    </Modal>
  );
}
