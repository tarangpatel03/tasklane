import type { ReactNode, RefObject } from 'react';
import { ChevronsLeftIcon, ChevronsRightIcon, MenuIcon } from '../components/icons';
import { ProfileMenu } from './profile-menu';
import styles from './top-bar.module.css';

interface TopBarProps {
  pageTitle: string;
  desktop: boolean;
  collapsed: boolean;
  sidebarId: string;
  sidebarOpen: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
}

/** Sticky header: sidebar toggle, breadcrumb and account menu. */
export function TopBar({
  pageTitle,
  desktop,
  collapsed,
  sidebarId,
  sidebarOpen,
  toggleRef,
  onToggle,
}: TopBarProps): ReactNode {
  const label = desktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open navigation';
  const expanded = desktop ? !collapsed : sidebarOpen;

  return (
    <header className={styles.bar}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        onClick={onToggle}
        aria-label={label}
        aria-expanded={expanded}
        aria-controls={sidebarId}
      >
        {!desktop ? <MenuIcon /> : collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
      </button>
      <p className={styles.crumb}>
        <span>Admin panel</span>
        <span aria-hidden="true">/</span>
        <span className={styles.current}>{pageTitle}</span>
      </p>
      <ProfileMenu />
    </header>
  );
}
