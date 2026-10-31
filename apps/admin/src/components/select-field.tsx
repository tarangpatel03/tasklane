import { useId, type ReactNode } from 'react';
import { ChevronDownIcon } from './icons';
import styles from './select-field.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

/**
 * Styled native select for filters. The empty-value option is the "all" choice; any other value turns the
 * control violet so active filters are easy to spot.
 */
export function SelectField({ label, value, options, onChange }: SelectFieldProps): ReactNode {
  const id = useId();

  return (
    <div className={`${styles.wrap} ${value ? styles.active : ''}`}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={18} />
    </div>
  );
}
