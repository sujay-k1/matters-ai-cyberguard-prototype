import { Checkbox, ComboBox, Dropdown, Modal, TextArea } from '@carbon/react';

interface EscalateCaseModalProps {
  open: boolean;
  team: string;
  urgency: string;
  reason: string;
  note: string;
  taskOwner: string;
  notifyDataOwner: boolean;
  teams: string[];
  owners: string[];
  onTeamChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onTaskOwnerChange: (value: string) => void;
  onNotifyDataOwnerChange: (checked: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function EscalateCaseModal(props: EscalateCaseModalProps) {
  const {
    open,
    team,
    urgency,
    reason,
    note,
    taskOwner,
    notifyDataOwner,
    teams,
    owners,
    onTeamChange,
    onUrgencyChange,
    onReasonChange,
    onNoteChange,
    onTaskOwnerChange,
    onNotifyDataOwnerChange,
    onClose,
    onSubmit,
  } = props;

  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading="Escalate case"
      primaryButtonText="Create handoff"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!team.trim() || !urgency.trim() || !reason.trim()}
      selectorPrimaryFocus="#escalate-reason"
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        <Dropdown
          id="escalate-team"
          titleText="Handoff team"
          label="Select team"
          items={teams.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={team ? { id: team, label: team } : null}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => onTeamChange(selectedItem?.label ?? '')}
        />
        <Dropdown
          id="escalate-urgency"
          titleText="Urgency"
          label="Select urgency"
          items={['Standard', 'High', 'Critical'].map((entry) => ({ id: entry, label: entry }))}
          selectedItem={urgency ? { id: urgency, label: urgency } : null}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => onUrgencyChange(selectedItem?.label ?? '')}
        />
        <TextArea id="escalate-reason" labelText="Reason" rows={3} value={reason} onChange={(event) => onReasonChange(event.currentTarget.value)} />
        <TextArea id="escalate-note" labelText="Note" rows={3} value={note} onChange={(event) => onNoteChange(event.currentTarget.value)} />
        <ComboBox id="escalate-task-owner" titleText="Optional task owner" items={owners} selectedItem={taskOwner} itemToString={(item) => item ?? ''} onChange={({ selectedItem }) => onTaskOwnerChange(selectedItem ?? '')} />
        <Checkbox id="escalate-notify-data-owner" labelText="Notify data owner" checked={notifyDataOwner} onChange={(_, { checked }) => onNotifyDataOwnerChange(Boolean(checked))} />
      </div>
    </Modal>
  );
}
