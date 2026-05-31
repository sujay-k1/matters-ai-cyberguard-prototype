import { useEffect, useState } from 'react';
import { Checkbox, Button, Modal } from '@carbon/react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ColumnDefinition } from '../types/queue';

interface ColumnCustomizerProps {
  open: boolean;
  columns: ColumnDefinition[];
  onClose: () => void;
  onApply: (columns: ColumnDefinition[]) => void;
}

export function ColumnCustomizer({ open, columns, onClose, onApply }: ColumnCustomizerProps) {
  const [draft, setDraft] = useState(columns);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setDraft(columns);
  }, [columns]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = draft.findIndex((column) => column.id === active.id);
    const newIndex = draft.findIndex((column) => column.id === over.id);
    setDraft(arrayMove(draft, oldIndex, newIndex));
  };

  const toggleVisibility = (id: string) => {
    setDraft((current) =>
      current.map((column) =>
        column.id === id && !column.required ? { ...column, visible: !column.visible } : column,
      ),
    );
  };

  const restoreDefaults = () => {
    setDraft(columns.map((column) => ({ ...column })));
  };

  return (
    <Modal
      open={open}
      modalHeading="Customize columns"
      primaryButtonText="Apply"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={() => onApply(draft)}
    >
      <div className="cg-column-modal">
        <div className="cg-column-modal__actions">
          <Button kind="ghost" size="sm" onClick={restoreDefaults}>
            Restore default order
          </Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={draft.map((column) => column.id)} strategy={verticalListSortingStrategy}>
            <div className="cg-column-list">
              {draft.map((column) => (
                <SortableColumnRow
                  key={column.id}
                  column={column}
                  onToggle={() => toggleVisibility(column.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </Modal>
  );
}

function SortableColumnRow({
  column,
  onToggle,
}: {
  column: ColumnDefinition;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
    disabled: column.required,
  });

  return (
    <div
      ref={setNodeRef}
      className={`cg-column-row ${column.required ? 'is-locked' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button type="button" className="cg-drag-handle" {...attributes} {...listeners} disabled={column.required}>
        ≡
      </button>
      <Checkbox
        id={`column-${column.id}`}
        labelText={column.label}
        checked={column.visible}
        disabled={column.required}
        onChange={onToggle}
      />
      {column.required ? <small>Required</small> : null}
    </div>
  );
}
