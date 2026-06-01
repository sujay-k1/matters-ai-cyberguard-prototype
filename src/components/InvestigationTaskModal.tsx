import { ComboBox, Modal, TextInput } from '@carbon/react';

interface InvestigationTaskModalProps {
  open: boolean;
  title: string;
  owner: string;
  owners: string[];
  onTitleChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function InvestigationTaskModal({
  open,
  title,
  owner,
  owners,
  onTitleChange,
  onOwnerChange,
  onClose,
  onSubmit,
}: InvestigationTaskModalProps) {
  return (
    <Modal
      open={open}
      className="cg-investigation-submodal"
      modalHeading="Add investigation task"
      primaryButtonText="Add task"
      secondaryButtonText="Cancel"
      primaryButtonDisabled={!title.trim() || !owner.trim()}
      onRequestClose={onClose}
      onRequestSubmit={onSubmit}
    >
      <div className="cg-dialog-stack">
        <TextInput
          id="investigation-task-title"
          labelText="Task"
          placeholder="Describe the next investigation check"
          value={title}
          onChange={(event) => onTitleChange(event.currentTarget.value)}
        />
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
