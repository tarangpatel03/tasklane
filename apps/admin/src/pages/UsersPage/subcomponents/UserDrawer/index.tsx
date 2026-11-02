import { Role, UserStatus } from '@task-app/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ApiRequestError } from '../../../../api/client.api';
import type { UpdateUserBody, UserDto } from '../../../../api/users.api';
import { Button } from '../../../../components/Button';
import { Drawer } from '../../../../components/Drawer';
import { AlertIcon } from '../../../../components/Icons';
import { TextField } from '../../../../components/TextField';
import { useToast } from '../../../../components/toast.context';
import { useCreateUser, useUpdateUser } from '../../useUsers';
import styles from './UserDrawer.module.css';

type AssignableRole = Role.MANAGER | Role.EMPLOYEE;

const ROLE_CHOICES: { value: AssignableRole; label: string }[] = [
  { value: Role.MANAGER, label: 'Manager' },
  { value: Role.EMPLOYEE, label: 'Employee' },
];

interface UserDrawerProps {
  open: boolean;
  /** The user being edited, or null for a new one. Kept while the drawer slides out. */
  user: UserDto | null;
  onClose: () => void;
}

type FieldErrors = Partial<Record<'name' | 'email', string>>;

/** Maps an API failure onto the form: field messages where the API names a field, a banner otherwise. */
function readError(error: unknown): { fields: FieldErrors; banner: string | null } {
  if (!(error instanceof ApiRequestError)) {
    return {
      fields: {},
      banner: 'Could not reach the server. Check your connection and try again.',
    };
  }
  const fields: FieldErrors = {};
  for (const detail of error.details ?? []) {
    if (detail.field === 'name' || detail.field === 'email') {
      fields[detail.field] = detail.messages[0];
    }
  }
  if (Object.keys(fields).length > 0) return { fields, banner: null };
  // The duplicate-email conflict has no field detail.
  if (error.statusCode === 409 && /email/i.test(error.message)) {
    return { fields: { email: error.message }, banner: null };
  }
  return { fields: {}, banner: error.message };
}

/** Create and edit form. The email can only change before the invite is accepted. */
export function UserDrawer({ open, user, onClose }: UserDrawerProps): ReactNode {
  return (
    <Drawer open={open} title={user ? 'Edit user' : 'New user'} onClose={onClose}>
      {/* The form renders its own buttons because they need its pending state. */}
      <UserForm key={user?.id ?? 'new'} user={user} onClose={onClose} />
    </Drawer>
  );
}

function UserForm({ user, onClose }: { user: UserDto | null; onClose: () => void }): ReactNode {
  const toast = useToast();
  const create = useCreateUser();
  const update = useUpdateUser();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? Role.EMPLOYEE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);

  const isAdmin = user?.role === Role.ADMIN;
  const emailLocked = user !== null && user.status !== UserStatus.INVITED;
  const pending = create.isPending || update.isPending;

  function fail(error: unknown): void {
    const result = readError(error);
    setFieldErrors(result.fields);
    setBanner(result.banner);
  }

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const errors: FieldErrors = {};
    if (!trimmedName) errors.name = 'Enter a name.';
    if (!trimmedEmail) errors.email = 'Enter an email address.';
    setFieldErrors(errors);
    setBanner(null);
    if (Object.keys(errors).length > 0) return;

    if (!user) {
      if (role === Role.ADMIN) return;
      create.mutate(
        { name: trimmedName, email: trimmedEmail, role },
        {
          onSuccess: (created) => {
            toast.show(`${created.name} was added as ${created.role.toLowerCase()}.`);
            onClose();
          },
          onError: fail,
        },
      );
      return;
    }

    const body: UpdateUserBody = {};
    if (trimmedName !== user.name) body.name = trimmedName;
    if (!emailLocked && trimmedEmail.toLowerCase() !== user.email) body.email = trimmedEmail;
    if (!isAdmin && role !== user.role && role !== Role.ADMIN) body.role = role;
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    update.mutate(
      { id: user.id, body },
      {
        onSuccess: (saved) => {
          toast.show(`${saved.name} was updated.`);
          onClose();
        },
        onError: fail,
      },
    );
  }

  return (
    <form id="user-form" className={styles.form} onSubmit={onSubmit} noValidate>
      {banner && (
        <p className={styles.banner} role="alert">
          <AlertIcon size={18} />
          {banner}
        </p>
      )}
      <TextField
        label="Full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={fieldErrors.name}
        autoComplete="off"
        maxLength={120}
        data-autofocus
      />
      <div className={styles.group}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          readOnly={emailLocked}
          autoComplete="off"
          maxLength={255}
        />
        {emailLocked && (
          <p className={styles.hint}>
            The email is fixed once the account is set up, because it is the sign-in name.
          </p>
        )}
      </div>
      <fieldset className={styles.roles} disabled={isAdmin}>
        <legend className={styles.legend}>Role</legend>
        {isAdmin ? (
          <p className={styles.hint}>Admin accounts are managed outside this panel.</p>
        ) : (
          <div className={styles.segmented}>
            {ROLE_CHOICES.map((choice) => (
              <label key={choice.value} className={styles.segment}>
                <input
                  type="radio"
                  name="role"
                  value={choice.value}
                  checked={role === choice.value}
                  onChange={() => setRole(choice.value)}
                  className={styles.radio}
                />
                <span>{choice.label}</span>
              </label>
            ))}
          </div>
        )}
        <p className={styles.hint}>
          {role === Role.MANAGER
            ? 'Managers create tasks and review work on the mobile app.'
            : 'Employees receive tasks and submit work on the mobile app.'}
        </p>
      </fieldset>
      <div className={styles.actions}>
        <Button variant="outlined" compact onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" compact loading={pending}>
          {user ? 'Save changes' : 'Create user'}
        </Button>
      </div>
    </form>
  );
}
