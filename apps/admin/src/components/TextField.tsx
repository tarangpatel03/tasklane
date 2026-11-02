import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertIcon, EyeIcon, EyeOffIcon } from './Icons';
import styles from './TextField.module.css';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Message shown under the field; its presence also marks the field invalid. */
  error?: string;
}

/** Labelled 56px input. A `password` type gets a show/hide toggle. */
export function TextField({ label, error, type = 'text', ...rest }: TextFieldProps): ReactNode {
  const id = useId();
  const errorId = `${id}-error`;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          {...rest}
          id={id}
          type={isPassword && revealed ? 'text' : type}
          className={`${styles.input} ${error ? styles.invalid : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          <AlertIcon size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
