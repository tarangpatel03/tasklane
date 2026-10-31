import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'tonal' | 'outlined' | 'text' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** 48px instead of 56px, for toolbars and dialogs. */
  compact?: boolean;
  /** Shows a spinner and blocks clicks while a request is running. */
  loading?: boolean;
  fullWidth?: boolean;
}

/** Pill button (56px primary by default) with a loading state. */
export function Button({
  variant = 'primary',
  compact = false,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps): ReactNode {
  const classes = [
    styles.button,
    variant === 'primary' ? '' : styles[variant],
    compact ? styles.compact : '',
    fullWidth ? styles.full : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
