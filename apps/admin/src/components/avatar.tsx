import type { ReactNode } from 'react';
import styles from './avatar.module.css';

const TONES = [styles.tone0, styles.tone1, styles.tone2, styles.tone3, styles.tone4];

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Initials-only avatar; the tone is picked from the name so it stays stable. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }): ReactNode {
  return (
    <span
      className={`${styles.avatar} ${TONES[name.length % TONES.length]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
