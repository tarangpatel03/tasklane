import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { LogoMark } from '../components/logo';
import { useAuth } from './auth-context';
import styles from './require-auth.module.css';
import { PATHS } from '../app/paths';

/** Route guard: renders child routes only for a signed-in Admin, otherwise goes to `/login`. */
export function RequireAuth(): ReactNode {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className={styles.splash} role="status" aria-label="Loading">
        <LogoMark size={64} />
      </div>
    );
  }
  if (status === 'anonymous')
    return <Navigate to={PATHS.login} replace state={{ from: location }} />;
  return <Outlet />;
}
