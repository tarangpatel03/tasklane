import { useState, type ReactNode, type SyntheticEvent } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ApiRequestError } from '../../api/client.api';
import { useAuth } from '../../auth/auth.context';
import { Button } from '../../components/Button';
import { AlertIcon } from '../../components/Icons';
import { Logo } from '../../components/Logo';
import { TextField } from '../../components/TextField';
import styles from './LoginPage.module.css';
import { PATHS } from '../../app/paths';

interface LocationState {
  from?: { pathname: string };
}

const EMAIL_PATTERN = /.+@.+\..+/;

/** Admin sign-in: hero on wide screens, stacked on narrow ones. */
export function LoginPage(): ReactNode {
  const { status, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    // Location state is set by RequireAuth, so this narrowing cast is safe.
    const from = (location.state as LocationState | null)?.from?.pathname;
    return <Navigate to={from ?? PATHS.dashboard} replace />;
  }

  const emailError =
    tried && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined;
  const passwordError = tried && !password ? 'Enter your password' : undefined;

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTried(true);
    setError(null);
    if (!EMAIL_PATTERN.test(email.trim()) || !password) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not sign in. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Logo markSize={52} />
        <div className={styles.heroCopy}>
          <h1 className={styles.headline}>Keep every task, Manager and Employee in view.</h1>
          <p className={styles.lead}>
            Create users, assign work, and review any task from one place.
          </p>
        </div>
      </section>

      <section className={styles.formSide}>
        <form className={styles.card} onSubmit={(event) => void onSubmit(event)} noValidate>
          <div className={styles.cardHead}>
            <h2 className={styles.title}>Sign in</h2>
            <p className={styles.sub}>Use your Admin account.</p>
          </div>

          {error && (
            <p className={styles.banner} role="alert">
              <AlertIcon />
              {error}
            </p>
          )}

          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={passwordError}
          />

          <Button type="submit" loading={submitting} fullWidth>
            Sign in
          </Button>

          <p className={styles.note}>
            Admin accounts only. Managers and Employees sign in on the mobile app.
          </p>
        </form>
      </section>
    </main>
  );
}
