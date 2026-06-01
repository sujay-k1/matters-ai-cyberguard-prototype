import { Checkbox, ComboBox, Dropdown, Modal } from '@carbon/react';
import { AISuggestedTextArea } from './AISuggestedTextArea';
import type { DraftProvenance } from '../types/ai';

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
  reasonSuggestion?: string;
  noteSuggestion?: string;
  onTeamChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onReasonProvenanceChange?: (value: DraftProvenance) => void;
  onNoteProvenanceChange?: (value: DraftProvenance) => void;
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
    reasonSuggestion,
    noteSuggestion,
    onTeamChange,
    onUrgencyChange,
    onReasonChange,
    onNoteChange,
    onReasonProvenanceChange,
    onNoteProvenanceChange,
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
        <AISuggestedTextArea id="escalate-reason" labelText="Reason" placeholder="Add the reason for escalation" aiSuggestion={reasonSuggestion} rows={3} value={reason} onChange={onReasonChange} onProvenanceChange={onReasonProvenanceChange} />
        <AISuggestedTextArea id="escalate-note" labelText="Note" placeholder="Capture any handoff context or request details" aiSuggestion={noteSuggestion} rows={3} value={note} onChange={onNoteChange} onProvenanceChange={onNoteProvenanceChange} />
        <ComboBox id="escalate-task-owner" titleText="Optional task owner" items={owners} selectedItem={taskOwner} itemToString={(item) => item ?? ''} onChange={({ selectedItem }) => onTaskOwnerChange(selectedItem ?? '')} />
        <Checkbox id="escalate-notify-data-owner" labelText="Notify data owner" checked={notifyDataOwner} onChange={(_, { checked }) => onNotifyDataOwnerChange(Boolean(checked))} />
      </div>
    </Modal>
  );
}
