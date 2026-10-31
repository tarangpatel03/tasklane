import { TaskPriority, TaskStatus } from '@task-app/shared';
import { useId, type ReactNode } from 'react';
import type { UserDto } from '../../api/users';
import { Button } from '../../components/button';
import { PlusIcon, RefreshIcon, SearchIcon } from '../../components/icons';
import { SelectField } from '../../components/select-field';
import { PRIORITY_LABEL, STATUS_LABEL } from '../../components/task-badges';
import styles from './tasks-toolbar.module.css';

export interface TaskFilters {
  search: string;
  status: '' | TaskStatus;
  priority: '' | TaskPriority;
  managerId: string;
  assigneeId: string;
  /** `YYYY-MM-DD`, or empty. */
  dueFrom: string;
  dueTo: string;
}

export const NO_TASK_FILTERS: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  managerId: '',
  assigneeId: '',
  dueFrom: '',
  dueTo: '',
};

export function hasTaskFilters(filters: TaskFilters): boolean {
  return Object.values(filters).some((value) => value !== '');
}

function isStatus(value: string): value is TaskFilters['status'] {
  return value === '' || Object.values<string>(TaskStatus).includes(value);
}

function isPriority(value: string): value is TaskFilters['priority'] {
  return value === '' || Object.values<string>(TaskPriority).includes(value);
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.values(TaskStatus).map((status) => ({ value: status, label: STATUS_LABEL[status] })),
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  ...Object.values(TaskPriority).map((p) => ({ value: p, label: PRIORITY_LABEL[p] })),
];

interface TasksToolbarProps {
  filters: TaskFilters;
  managers: UserDto[];
  employees: UserDto[];
  refreshing: boolean;
  onChange: (filters: TaskFilters) => void;
  onClear: () => void;
  onRefresh: () => void;
  onCreate: () => void;
}

/** Search, status, priority, Manager, assignee and due-date filters, plus refresh and New task. */
export function TasksToolbar({
  filters,
  managers,
  employees,
  refreshing,
  onChange,
  onClear,
  onRefresh,
  onCreate,
}: TasksToolbarProps): ReactNode {
  const searchId = useId();
  const fromId = useId();
  const toId = useId();

  return (
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <label htmlFor={searchId} className="visually-hidden">
          Search tasks by title
        </label>
        <SearchIcon size={20} />
        <input
          id={searchId}
          type="search"
          className={styles.input}
          placeholder="Search task title"
          value={filters.search}
          maxLength={100}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </div>
      <div className={styles.selects}>
        <SelectField
          label="Filter by status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(value) => isStatus(value) && onChange({ ...filters, status: value })}
        />
        <SelectField
          label="Filter by priority"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(value) => isPriority(value) && onChange({ ...filters, priority: value })}
        />
        <SelectField
          label="Filter by Manager"
          value={filters.managerId}
          options={[
            { value: '', label: 'Any Manager' },
            ...managers.map((user) => ({ value: user.id, label: user.name })),
          ]}
          onChange={(value) => onChange({ ...filters, managerId: value })}
        />
        <SelectField
          label="Filter by assignee"
          value={filters.assigneeId}
          options={[
            { value: '', label: 'Any assignee' },
            ...employees.map((user) => ({ value: user.id, label: user.name })),
          ]}
          onChange={(value) => onChange({ ...filters, assigneeId: value })}
        />
      </div>
      <div className={styles.dates}>
        <label htmlFor={fromId} className={styles.dateLabel}>
          Due from
        </label>
        <input
          id={fromId}
          type="date"
          className={`${styles.date} ${filters.dueFrom ? styles.dateActive : ''}`}
          value={filters.dueFrom}
          max={filters.dueTo || undefined}
          onChange={(event) => onChange({ ...filters, dueFrom: event.target.value })}
        />
        <label htmlFor={toId} className={styles.dateLabel}>
          to
        </label>
        <input
          id={toId}
          type="date"
          className={`${styles.date} ${filters.dueTo ? styles.dateActive : ''}`}
          value={filters.dueTo}
          min={filters.dueFrom || undefined}
          onChange={(event) => onChange({ ...filters, dueTo: event.target.value })}
        />
      </div>
      <div className={styles.actions}>
        {hasTaskFilters(filters) && (
          <Button variant="text" compact onClick={onClear}>
            Clear filters
          </Button>
        )}
        <button
          type="button"
          className={`${styles.refresh} ${refreshing ? styles.spinning : ''}`}
          onClick={onRefresh}
          aria-label="Refresh tasks"
        >
          <RefreshIcon size={20} />
        </button>
        <Button compact onClick={onCreate}>
          <PlusIcon size={20} />
          New task
        </Button>
      </div>
    </div>
  );
}
