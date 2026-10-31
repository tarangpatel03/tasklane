import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AlertIcon, CheckIcon, ChevronDownIcon } from './icons';
import type { SelectOption } from './select-field';
import styles from './dropdown.module.css';

interface DropdownProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Message shown under the field; its presence also marks the field invalid. */
  error?: string;
}

/** Labelled form dropdown with a listbox popover, for forms where a native select looks out of place. */
export function Dropdown({ label, value, options, onChange, error }: DropdownProps): ReactNode {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && !wrapRef.current?.contains(event.target)) setOpen(false);
    }
    const list = wrapRef.current?.querySelector('[role="listbox"]');
    const target =
      list?.querySelector<HTMLElement>('[aria-selected="true"]') ?? list?.querySelector('button');
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest' });
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!open) return;
    if (event.key === 'Escape') {
      // Why: the drawer also closes on Esc, and this press should only close the list.
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = Array.from(
      wrapRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    );
    const index = items.findIndex((item) => item === document.activeElement);
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  }

  return (
    <div className={styles.field} ref={wrapRef} onKeyDown={onKeyDown}>
      <span id={id} className={styles.label}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${error ? styles.invalid : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={id}
          aria-invalid={error ? true : undefined}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          {current?.label}
          <ChevronDownIcon size={18} />
        </button>
        <div
          className={`${styles.list} ${open ? styles.open : ''}`}
          role="listbox"
          aria-labelledby={id}
          inert={!open}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`${styles.option} ${selected ? styles.selected : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                {option.label}
                {selected && <CheckIcon size={16} />}
              </button>
            );
          })}
        </div>
      </div>
      {error && (
        <p className={styles.error}>
          <AlertIcon size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
