import { ComboBox, Modal, TextInput } from '@carbon/react';
import { AISuggestedTextInput } from './AISuggestedTextInput';
import type { DraftProvenance } from '../types/ai';

interface InvestigationTaskModalProps {
  open: boolean;
  mode?: 'add' | 'assign';
  title: string;
  owner: string;
  owners: string[];
  taskTitleSuggestion?: string;
  onTitleChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onTaskTitleProvenanceChange?: (value: DraftProvenance) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function InvestigationTaskModal({
  open,
  mode = 'add',
  title,
  owner,
  owners,
  taskTitleSuggestion,
  onTitleChange,
  onOwnerChange,
  onTaskTitleProvenanceChange,
  onClose,
  onSubmit,
}: InvestigationTaskModalProps) {
  const isAssignMode = mode === 'assign';

  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading={isAssignMode ? 'Assign investigation task' : 'Add investigation task'}
      primaryButtonText={isAssignMode ? 'Save owner' : 'Add task'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={isAssignMode ? !owner.trim() : !title.trim() || !owner.trim()}
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        {isAssignMode ? (
          <TextInput
            id="investigation-task-title-readonly"
            labelText="Task"
            value={title}
            readOnly
          />
        ) : (
          <AISuggestedTextInput
            id="investigation-task-title"
            labelText="Task"
            placeholder="Describe the next investigation check"
            aiSuggestion={taskTitleSuggestion}
            value={title}
            onChange={onTitleChange}
            onProvenanceChange={onTaskTitleProvenanceChange}
          />
        )}
        <ComboBox
          id="investigation-task-owner"
          titleText="Owner"
          placeholder="Select an owner"
          items={owners.map((entry) => ({ id: entry, label: entry }))}
          selectedItem={owner ? { id: owner, label: owner } : null}
          itemToString={(item) => item?.label ?? ''}
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              onOwnerChange(selectedItem.label);
            }
          }}
        />
      </div>
    </Modal>
  );
}
