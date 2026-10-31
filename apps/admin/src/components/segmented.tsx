import type { ReactNode } from 'react';
import styles from './segmented.module.css';

interface SegmentedProps<T extends string> {
  /** Names the radio group for screen readers and keeps the browser's arrow-key behaviour per group. */
  name: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Pill-shaped radio group, e.g. task priority. */
export function Segmented<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>): ReactNode {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>
      <div
        className={styles.track}
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((option) => (
          <label key={option.value} className={styles.segment}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.radio}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
