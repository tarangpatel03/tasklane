import type { ReactNode } from 'react';
import { Avatar } from './avatar';
import styles from './avatar-stack.module.css';

interface AvatarStackProps {
  names: string[];
  /** How many avatars to draw before collapsing the rest into "+n". */
  max?: number;
  size?: number;
}

/** Overlapping initials avatars with a 2px white ring. The full list is in the accessible label. */
export function AvatarStack({ names, max = 3, size = 32 }: AvatarStackProps): ReactNode {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  return (
    <span className={styles.stack} role="img" aria-label={names.join(', ') || 'Nobody'}>
      {shown.map((name, index) => (
        <span key={`${name}-${index}`} className={styles.item}>
          <Avatar name={name} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span className={`${styles.item} ${styles.more}`} style={{ width: size, height: size }}>
          +{extra}
        </span>
      )}
    </span>
  );
}
