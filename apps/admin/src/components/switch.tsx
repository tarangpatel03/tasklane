import { useId, type ReactNode } from 'react';
import styles from './switch.module.css';

interface SwitchProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Labelled toggle built on a checkbox with `role="switch"`. */
export function Switch({ label, hint, checked, onChange }: SwitchProps): ReactNode {
  const id = useId();

  return (
    <div className={styles.row}>
      <label htmlFor={id} className={styles.text}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}
