import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { AlertIcon } from './Icons';
import fieldStyles from './TextField.module.css';
import styles from './TextAreaField.module.css';

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  /** Message shown under the field; its presence also marks the field invalid. */
  error?: string;
  /** Hides the visible label (the label still names the field for screen readers). */
  hideLabel?: boolean;
}

/** Labelled multi-line input that shares the text field's look. */
export function TextAreaField({
  label,
  error,
  hideLabel = false,
  ...rest
}: TextAreaFieldProps): ReactNode {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={fieldStyles.field}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : fieldStyles.label}>
        {label}
      </label>
      <textarea
        {...rest}
        id={id}
        className={`${styles.area} ${error ? fieldStyles.invalid : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className={fieldStyles.error}>
          <AlertIcon size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
