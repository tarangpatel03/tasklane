import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NAV_ITEMS, Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useMediaQuery } from './useMediaQuery';
import styles from './AppShell.module.css';
import { PATHS } from '../app/paths';

const SIDEBAR_ID = 'main-sidebar';

function titleFor(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.to === PATHS.dashboard
      ? pathname === PATHS.dashboard
      : pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  return match?.label ?? 'Dashboard';
}

/** Layout for every signed-in page: sidebar, top bar and the routed content. */
export function AppShell(): ReactNode {
  const { pathname } = useLocation();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Why: the drawer would stay open over the new page after a link click or a resize to desktop.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, desktop]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.getElementById(SIDEBAR_ID)?.querySelector('a')?.focus();
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeDrawer();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, closeDrawer]);

  function onToggle(): void {
    if (desktop) setCollapsed((value) => !value);
    else setDrawerOpen((value) => !value);
  }

  return (
    <div className={styles.shell}>
      <a href="#content" className={styles.skip}>
        Skip to content
      </a>
      <Sidebar
        id={SIDEBAR_ID}
        collapsed={collapsed}
        drawer={!desktop}
        open={drawerOpen}
        onClose={closeDrawer}
      />
      {!desktop && (
        <div
          className={`${styles.scrim} ${drawerOpen ? styles.scrimOn : ''}`}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <div className={styles.main}>
        <TopBar
          pageTitle={titleFor(pathname)}
          desktop={desktop}
          collapsed={collapsed}
          sidebarId={SIDEBAR_ID}
          sidebarOpen={drawerOpen}
          toggleRef={toggleRef}
          onToggle={onToggle}
        />
        <main id="content" tabIndex={-1} key={pathname} className={styles.page}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
