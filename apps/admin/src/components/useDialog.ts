import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';

/** Matches the exit animation length in the drawer and modal styles. */
const EXIT_MS = 240;

interface DialogBinding {
  ref: RefObject<HTMLDialogElement | null>;
  /** False once the exit animation has finished; render nothing then. */
  visible: boolean;
  leaving: boolean;
  onCancel: (event: SyntheticEvent<HTMLDialogElement>) => void;
  onClick: (event: MouseEvent<HTMLDialogElement>) => void;
}

/**
 * Drives a native modal `<dialog>` from an `open` flag. The dialog stays mounted for the exit animation,
 * and the browser handles focus trapping, Esc and focus return.
 */
export function useDialog(open: boolean, onClose: () => void): DialogBinding {
  const ref = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(open);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setLeaving(false);
      return;
    }
    if (!visible) return;
    setLeaving(true);
    const timer = window.setTimeout(() => {
      ref.current?.close();
      setVisible(false);
      setLeaving(false);
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, visible]);

  useEffect(() => {
    const dialog = ref.current;
    if (visible && open && dialog && !dialog.open) {
      dialog.showModal();
      // Why: React's autoFocus runs before the dialog is shown, so a marked field is focused here instead.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
    }
  }, [visible, open]);

  return {
    ref,
    visible,
    leaving,
    // Why: the browser would close the dialog at once; closing goes through `onClose` so the exit animation runs.
    onCancel(event) {
      event.preventDefault();
      onClose();
    },
    // The dialog fills the viewport and the panel sits inside it, so a click on the dialog itself is a scrim click.
    onClick(event) {
      if (event.target === ref.current) onClose();
    },
  };
}
