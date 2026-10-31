import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreIcon } from './icons';
import styles from './row-menu.module.css';

export interface RowMenuItem {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

interface RowMenuProps {
  /** Names the row for screen readers, e.g. "Actions for Priya Nair". */
  label: string;
  items: RowMenuItem[];
}

const MENU_WIDTH = 210;
const ITEM_HEIGHT = 44;

/**
 * Three-dot button with a popover. The popover is portalled to the body and fixed-positioned, because the
 * page's entrance animation and the table's scroll container would otherwise clip or offset it.
 */
export function RowMenu({ label, items }: RowMenuProps): ReactNode {
  const [position, setPosition] = useState<CSSProperties | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = position !== null;

  useEffect(() => {
    if (!open) return;
    function close(): void {
      setPosition(null);
    }
    function onPointerDown(event: PointerEvent): void {
      if (!(event.target instanceof Node)) return;
      if (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target))
        return;
      close();
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        close();
        buttonRef.current?.focus();
      }
    }
    menuRef.current?.querySelector('button')?.focus({ preventScroll: true });
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    // Why: a fixed popover would drift away from its row when anything scrolls.
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  function toggle(): void {
    if (open) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = items.length * ITEM_HEIGHT + 16;
    const flip = rect.bottom + height > window.innerHeight && rect.top > height;
    setPosition({
      left: Math.max(8, rect.right - MENU_WIDTH),
      top: flip ? rect.top - height - 4 : rect.bottom + 4,
    });
  }

  if (items.length === 0) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
      >
        <MoreIcon size={20} />
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} className={styles.menu} style={position} role="menu">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`${styles.item} ${item.danger ? styles.danger : ''}`}
                onClick={() => {
                  setPosition(null);
                  item.onSelect();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
