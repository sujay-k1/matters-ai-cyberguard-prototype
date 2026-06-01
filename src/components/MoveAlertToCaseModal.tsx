import { Dropdown, Modal, TextArea, TextInput } from '@carbon/react';

interface MoveAlertToCaseModalProps {
  open: boolean;
  alertId: string;
  currentCaseLabel: string;
  destinationCaseId: string;
  reason: string;
  destinationOptions: Array<{ id: string; label: string }>;
  onDestinationChange: (value: string) => void;
  onReasonChange: (value: string) => void;
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
  onDestinationChange,
  onReasonChange,
  onClose,
  onSubmit,
}: MoveAlertToCaseModalProps) {
  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading="Move alert to another case"
      primaryButtonText="Move alert"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!destinationCaseId || !reason.trim()}
      selectorPrimaryFocus="#move-alert-reason"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
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
        <TextArea
          id="move-alert-reason"
          labelText="Reason"
          rows={4}
          value={reason}
          onChange={(event) => onReasonChange(event.currentTarget.value)}
        />
      </div>
    </Modal>
  );
}
