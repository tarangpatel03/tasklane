import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/button';
import { LogoMark } from '../components/logo';
import styles from './not-found-page.module.css';
import { PATHS } from '../app/paths';

export function NotFoundPage(): ReactNode {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <LogoMark size={64} />
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>This address does not exist in the admin panel.</p>
      <Button onClick={() => void navigate(PATHS.dashboard)}>Back to dashboard</Button>
    </main>
  );
}
