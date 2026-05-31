import { Modal } from '@carbon/react';

export function ShortcutGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const shortcuts = [
    ['/','Focus queue search'],
    ['Shift+S','Focus queue search'],
    ['Shift+F','Focus filter search'],
    ['?','Open keyboard-shortcut guide'],
    ['G then F','Focus filter panel and enter filter-navigation mode'],
    ['G then T','Focus queue toolbar'],
    ['G then L','Focus work-queue list'],
    ['G then P','Focus pagination controls'],
    ['Shift+P','Focus the preview drawer when open'],
    ['Shift+B','Focus the bulk actions area when visible'],
    ['Esc','Close flyout, drawer, modal, or keyboard mode'],
    ['Arrow keys','Move through filter families or flyout values'],
    ['Enter','Open the focused filter flyout'],
    ['Space','Toggle the focused filter value'],
  ];

  return (
    <Modal
      open={open}
      modalHeading="Keyboard shortcuts"
      passiveModal
      onRequestClose={onClose}
    >
      <div className="cg-shortcut-guide">
        {shortcuts.map(([keys, description]) => (
          <div key={keys}>
            <strong>{keys}</strong>
            <span>{description}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
