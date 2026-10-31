import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/auth-context';
import { Avatar } from '../components/avatar';
import { ChevronDownIcon, SignOutIcon } from '../components/icons';
import styles from './profile-menu.module.css';

/** Avatar button in the top bar; the popover shows who is signed in and the log-out action. */
export function ProfileMenu(): ReactNode {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && !wrapRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={user.name} size={40} />
        <span className={styles.name}>
          <span className={styles.nameText}>{user.name}</span>
          <span className={styles.role}>Admin</span>
        </span>
        <ChevronDownIcon size={18} />
      </button>

      <div className={`${styles.popover} ${open ? styles.open : ''}`} hidden={!open}>
        <div className={styles.who}>
          <span className={styles.whoName}>{user.name}</span>
          <span className={styles.whoEmail}>{user.email}</span>
        </div>
        <button type="button" className={styles.item} onClick={() => void logout()}>
          <SignOutIcon size={20} />
          Log out
        </button>
      </div>
    </div>
  );
}
