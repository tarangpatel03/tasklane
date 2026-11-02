import { Role, TaskPriority } from '@task-app/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ApiRequestError } from '../../api/client.api';
import type { CreateTaskBody, TaskDto, UpdateTaskBody } from '../../api/tasks.api';
import { Button } from '../../components/Button';
import { Drawer } from '../../components/Drawer';
import { Dropdown } from '../../components/Dropdown';
import { AlertIcon } from '../../components/Icons';
import { Segmented } from '../../components/Segmented';
import { Switch } from '../../components/Switch';
import { TextAreaField } from '../../components/TextAreaField';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/toast.context';
import { PRIORITY_LABEL } from '../../components/TaskBadges';
import { PersonPicker } from './PersonPicker';
import { formatDue, fromDateInput, parseDisplayDate, toDateInput } from './taskUtils.util';
import { useCreateTask, usePeople, useUpdateTask } from './useTasks';
import styles from './TaskDrawer.module.css';

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
  value: priority,
  label: PRIORITY_LABEL[priority],
}));

interface TaskDrawerProps {
  open: boolean;
  /** The task being edited, or null for a new one. Kept while the drawer slides out. */
  task: TaskDto | null;
  onClose: () => void;
}

type FieldKey = 'title' | 'description' | 'dueDate' | 'assigneeIds' | 'managerId';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_KEYS: readonly string[] = [
  'title',
  'description',
  'dueDate',
  'assigneeIds',
  'managerId',
];

function isFieldKey(value: string): value is FieldKey {
  return FIELD_KEYS.includes(value);
}

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
    if (isFieldKey(detail.field)) fields[detail.field] = detail.messages[0];
  }
  if (Object.keys(fields).length > 0) return { fields, banner: null };
  return { fields: {}, banner: error.message };
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

/** Create and edit form for a task, including its Manager and Employees. */
export function TaskDrawer({ open, task, onClose }: TaskDrawerProps): ReactNode {
  return (
    <Drawer open={open} title={task ? 'Edit task' : 'New task'} onClose={onClose} width={520}>
      {/* The form renders its own buttons because they need its pending state. */}
      <TaskForm key={task?.id ?? 'new'} task={task} onClose={onClose} />
    </Drawer>
  );
}

function TaskForm({ task, onClose }: { task: TaskDto | null; onClose: () => void }): ReactNode {
  const toast = useToast();
  const create = useCreateTask();
  const update = useUpdateTask();
  const managers = usePeople(Role.MANAGER);
  const employees = usePeople(Role.EMPLOYEE);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState(task?.dueDate ? formatDue(task.dueDate) : '');
  const [requiresReview, setRequiresReview] = useState(task?.requiresReview ?? true);
  const [manager, setManager] = useState(task?.manager?.id ?? '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task?.assignees.map((user) => user.id) ?? [],
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const pending = create.isPending || update.isPending;
  const managerOptions = [
    { value: '', label: 'No Manager' },
    ...(managers.data ?? []).map((user) => ({ value: user.id, label: user.name })),
    // Keeps a Manager who has since been deactivated visible instead of silently clearing them.
    ...(task?.manager && !(managers.data ?? []).some((user) => user.id === task.manager?.id)
      ? [{ value: task.manager.id, label: task.manager.name }]
      : []),
  ];

  function fail(error: unknown): void {
    const result = readError(error);
    setFieldErrors(result.fields);
    setBanner(result.banner);
  }

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const errors: FieldErrors = {};
    if (!trimmedTitle) errors.title = 'Enter a title.';
    if (assigneeIds.length === 0) errors.assigneeIds = 'Pick at least one Employee.';
    const dueIso = dueDate.trim() ? parseDisplayDate(dueDate) : '';
    if (dueIso === null) errors.dueDate = 'Enter a date as dd/mm/yyyy.';
    setFieldErrors(errors);
    setBanner(null);
    if (Object.keys(errors).length > 0) return;

    if (!task) {
      const body: CreateTaskBody = {
        title: trimmedTitle,
        priority,
        requiresReview,
        assigneeIds,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        ...(dueIso ? { dueDate: fromDateInput(dueIso) } : {}),
        ...(manager ? { managerId: manager } : {}),
      };
      create.mutate(body, {
        onSuccess: (created) => {
          toast.show(`Task “${created.title}” was created.`);
          onClose();
        },
        onError: fail,
      });
      return;
    }

    const body: UpdateTaskBody = {};
    if (trimmedTitle !== task.title) body.title = trimmedTitle;
    if (trimmedDescription !== (task.description ?? '')) {
      body.description = trimmedDescription || null;
    }
    if (priority !== task.priority) body.priority = priority;
    if (dueIso !== toDateInput(task.dueDate)) body.dueDate = fromDateInput(dueIso ?? '') ?? null;
    if (requiresReview !== task.requiresReview) body.requiresReview = requiresReview;
    if (manager !== (task.manager?.id ?? '')) body.managerId = manager || null;
    if (
      !sameSet(
        assigneeIds,
        task.assignees.map((user) => user.id),
      )
    ) {
      body.assigneeIds = assigneeIds;
    }
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    update.mutate(
      { id: task.id, body },
      {
        onSuccess: (saved) => {
          toast.show(`Task “${saved.title}” was updated.`);
          onClose();
        },
        onError: fail,
      },
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {banner && (
        <p className={styles.banner} role="alert">
          <AlertIcon size={18} />
          {banner}
        </p>
      )}
      <TextField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldErrors.title}
        maxLength={120}
        autoComplete="off"
        data-autofocus
      />
      <TextAreaField
        label="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={fieldErrors.description}
        maxLength={2000}
      />
      <Segmented
        name="priority"
        label="Priority"
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={setPriority}
      />
      <TextField
        label="Due date (optional)"
        placeholder="dd/mm/yyyy"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        error={fieldErrors.dueDate}
      />
      <Switch
        label="Requires review"
        hint={
          requiresReview
            ? 'Employees submit the work and the Manager approves it.'
            : 'Employees mark the task complete themselves.'
        }
        checked={requiresReview}
        onChange={setRequiresReview}
      />
      <Dropdown
        label="Manager"
        value={manager}
        options={managerOptions}
        onChange={setManager}
        error={fieldErrors.managerId}
      />
      <PersonPicker
        label="Employees"
        people={employees.data ?? []}
        selected={assigneeIds}
        onChange={setAssigneeIds}
        loading={employees.isPending}
        error={fieldErrors.assigneeIds}
      />
      <div className={styles.actions}>
        <Button variant="outlined" compact onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" compact loading={pending}>
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}
