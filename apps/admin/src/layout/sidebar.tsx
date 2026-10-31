import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { CloseIcon, DashboardIcon, TasksIcon, UsersIcon } from '../components/icons';
import { Logo } from '../components/logo';
import styles from './sidebar.module.css';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/tasks', label: 'Tasks', icon: <TasksIcon />, end: false },
  { to: '/users', label: 'Users', icon: <UsersIcon />, end: false },
];

interface SidebarProps {
  id: string;
  /** Icons only (desktop). */
  collapsed: boolean;
  /** Off-canvas mode (below 1024px). */
  drawer: boolean;
  open: boolean;
  onClose: () => void;
}

/** Main navigation: fixed column on desktop, slide-in drawer on smaller screens. */
export function Sidebar({ id, collapsed, drawer, open, onClose }: SidebarProps): ReactNode {
  const classes = [
    styles.sidebar,
    drawer ? styles.drawer : '',
    drawer && open ? styles.open : '',
    !drawer && collapsed ? styles.collapsed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside id={id} className={classes} inert={drawer && !open}>
      <div className={styles.head}>
        <div className={styles.brand}>
          <Logo caption />
        </div>
        {drawer && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <nav aria-label="Main" className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            aria-label={!drawer && collapsed ? item.label : undefined}
            title={!drawer && collapsed ? item.label : undefined}
          >
            {item.icon}
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
