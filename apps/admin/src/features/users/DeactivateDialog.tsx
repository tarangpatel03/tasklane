import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ApiRequestError } from '../../api/client.api';
import type { UserDto } from '../../api/users.api';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/toast.context';
import { UserStatus } from '@task-app/shared';
import { useUpdateUser } from './useUsers';
import styles from './DeactivateDialog.module.css';
import { PATHS } from '../../app/paths';

interface DeactivateDialogProps {
  /** The user to deactivate, or null when closed. Kept while the dialog fades out. */
  user: UserDto | null;
  open: boolean;
  onClose: () => void;
}

/** The API lists open tasks as "Title (uuid)" under the `tasks` field. */
function blockingTaskTitles(error: ApiRequestError): string[] {
  return (error.details ?? [])
    .filter((detail) => detail.field === 'tasks')
    .flatMap((detail) => detail.messages)
    .map((message) => message.replace(/\s*\([0-9a-f-]{36}\)$/i, ''));
}

/** Confirms a deactivation; if the API refuses because of open tasks, lists them with a link to Tasks. */
export function DeactivateDialog({ user, open, onClose }: DeactivateDialogProps): ReactNode {
  return (
    <Modal
      open={open}
      title={user ? `Deactivate ${user.name}?` : 'Deactivate user'}
      onClose={onClose}
    >
      {user && <DeactivateBody key={user.id} user={user} onClose={onClose} />}
    </Modal>
  );
}

function DeactivateBody({ user, onClose }: { user: UserDto; onClose: () => void }): ReactNode {
  const toast = useToast();
  const update = useUpdateUser();
  const [blocking, setBlocking] = useState<string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function confirm(): void {
    setMessage(null);
    update.mutate(
      { id: user.id, body: { status: UserStatus.DEACTIVATED } },
      {
        onSuccess: () => {
          toast.show(`${user.name} was deactivated.`);
          onClose();
        },
        onError: (error) => {
          if (error instanceof ApiRequestError) {
            const titles = blockingTaskTitles(error);
            if (titles.length > 0) {
              setBlocking(titles);
              return;
            }
            setMessage(error.message);
            return;
          }
          setMessage('Could not reach the server. Check your connection and try again.');
        },
      },
    );
  }

  if (blocking) {
    return (
      <>
        <p>
          <strong>{user.name}</strong> is still on open tasks. Reassign or complete these first:
        </p>
        <ul className={styles.tasks}>
          {blocking.map((title, index) => (
            <li key={`${title}-${index}`}>{title}</li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button variant="outlined" compact onClick={onClose}>
            Close
          </Button>
          <Link to={PATHS.tasks} className={styles.link} onClick={onClose}>
            Go to Tasks
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p>They will be signed out right away and cannot log in until you reactivate the account.</p>
      {message && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
      <div className={styles.actions}>
        <Button variant="outlined" compact onClick={onClose} disabled={update.isPending}>
          Cancel
        </Button>
        <Button variant="destructive" compact onClick={confirm} loading={update.isPending}>
          Deactivate
        </Button>
      </div>
    </>
  );
}
