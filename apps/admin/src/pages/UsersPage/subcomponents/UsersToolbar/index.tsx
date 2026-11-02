import { Role, UserStatus } from '@task-app/shared';
import { useId, type ReactNode } from 'react';
import { Button } from '../../../../components/Button';
import { PlusIcon, RefreshIcon, SearchIcon } from '../../../../components/Icons';
import { SelectField } from '../../../../components/SelectField';
import styles from './UsersToolbar.module.css';

export interface UserFilters {
  search: string;
  role: '' | Role.MANAGER | Role.EMPLOYEE;
  status: '' | UserStatus;
}

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: Role.MANAGER, label: 'Manager' },
  { value: Role.EMPLOYEE, label: 'Employee' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: UserStatus.ACTIVE, label: 'Active' },
  { value: UserStatus.INVITED, label: 'Invited' },
  { value: UserStatus.DEACTIVATED, label: 'Deactivated' },
];

interface UsersToolbarProps {
  filters: UserFilters;
  refreshing: boolean;
  onChange: (filters: UserFilters) => void;
  onClear: () => void;
  onRefresh: () => void;
  onCreate: () => void;
}

function isRoleFilter(value: string): value is UserFilters['role'] {
  return value === '' || value === Role.MANAGER || value === Role.EMPLOYEE;
}

function isStatusFilter(value: string): value is UserFilters['status'] {
  return value === '' || Object.values<string>(UserStatus).includes(value);
}

/** Search, role and status filters, plus refresh and the New user button. */
export function UsersToolbar({
  filters,
  refreshing,
  onChange,
  onClear,
  onRefresh,
  onCreate,
}: UsersToolbarProps): ReactNode {
  const searchId = useId();
  const hasFilters = filters.search !== '' || filters.role !== '' || filters.status !== '';

  return (
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <label htmlFor={searchId} className="visually-hidden">
          Search users by name or email
        </label>
        <SearchIcon size={20} />
        <input
          id={searchId}
          type="search"
          className={styles.input}
          placeholder="Search name or email"
          value={filters.search}
          maxLength={100}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </div>
      <div className={styles.selects}>
        <SelectField
          label="Filter by role"
          value={filters.role}
          options={ROLE_OPTIONS}
          onChange={(value) => isRoleFilter(value) && onChange({ ...filters, role: value })}
        />
        <SelectField
          label="Filter by status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(value) => isStatusFilter(value) && onChange({ ...filters, status: value })}
        />
      </div>
      <div className={styles.actions}>
        {hasFilters && (
          <Button variant="text" compact onClick={onClear}>
            Clear filters
          </Button>
        )}
        <button
          type="button"
          className={`${styles.refresh} ${refreshing ? styles.spinning : ''}`}
          onClick={onRefresh}
          aria-label="Refresh users"
        >
          <RefreshIcon size={20} />
        </button>
        <Button compact onClick={onCreate}>
          <PlusIcon size={20} />
          New user
        </Button>
      </div>
    </div>
  );
}
