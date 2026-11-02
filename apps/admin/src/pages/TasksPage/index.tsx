import { Role, TaskAction, TaskPriority, TaskStatus } from '@task-app/shared';
import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import type { TaskDto } from '../../api/tasks.api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/toast.context';
import { RejectDialog, DeleteDialog } from './subcomponents/TaskDialogs';
import { TaskDetail } from './subcomponents/TaskDetail';
import { TaskDrawer } from './subcomponents/TaskDrawer';
import { fromDateInput } from './taskUtils.util';
import { TasksList, TasksListSkeleton } from './subcomponents/TasksList';
import {
  hasTaskFilters,
  NO_TASK_FILTERS,
  TasksToolbar,
  type TaskFilters,
} from './subcomponents/TasksToolbar';
import { usePeople, useTasksList, useTransitionTask } from './useTasks';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import styles from './TasksPage.module.css';

const PAGE_SIZE = 8;

/** Filters the URL may preset (the Dashboard links here with `?status=`). Unknown values are ignored. */
function initialFilters(params: URLSearchParams): TaskFilters {
  return {
    ...NO_TASK_FILTERS,
    status: Object.values(TaskStatus).find((value) => value === params.get('status')) ?? '',
    priority: Object.values(TaskPriority).find((value) => value === params.get('priority')) ?? '',
    managerId: params.get('managerId') ?? '',
  };
}

/** Tasks screen: filterable list, create and edit drawer, detail drawer, approve, reject and delete. */
export function TasksPage(): ReactNode {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<TaskFilters>(() => initialFilters(searchParams));
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDto | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejecting, setRejecting] = useState<TaskDto | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<TaskDto | null>(null);

  // The open task lives in the URL so a reload keeps the drawer; the last id is kept for the slide-out.
  const taskParam = searchParams.get('task');
  const [lastTaskId, setLastTaskId] = useState<string | null>(taskParam);
  useEffect(() => {
    if (taskParam) setLastTaskId(taskParam);
  }, [taskParam]);

  const search = useDebouncedValue(filters.search.trim(), 300);
  const list = useTasksList({
    page,
    limit: PAGE_SIZE,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    managerId: filters.managerId || undefined,
    assigneeId: filters.assigneeId || undefined,
    dueFrom: fromDateInput(filters.dueFrom, 'start'),
    dueTo: fromDateInput(filters.dueTo, 'end'),
    search: search || undefined,
  });
  const managers = usePeople(Role.MANAGER);
  const employees = usePeople(Role.EMPLOYEE);
  const transition = useTransitionTask();

  function changeFilters(next: TaskFilters): void {
    setFilters(next);
    setPage(1);
  }

  function openDetail(task: TaskDto): void {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('task', task.id);
        return next;
      },
      { replace: false },
    );
  }

  function closeDetail(): void {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('task');
        return next;
      },
      { replace: true },
    );
  }

  function openForm(task: TaskDto | null): void {
    setEditing(task);
    setFormOpen(true);
  }

  function approve(task: TaskDto): void {
    transition.mutate(
      { id: task.id, action: TaskAction.APPROVE },
      {
        onSuccess: () => toast.show(`“${task.title}” was approved.`),
        onError: (error) => toast.show(error.message, 'error'),
      },
    );
  }

  function askReject(task: TaskDto): void {
    setRejecting(task);
    setRejectOpen(true);
  }

  function askDelete(task: TaskDto): void {
    setDeleting(task);
    setDeleteOpen(true);
  }

  const tasks = list.data?.items ?? [];
  const meta = list.data?.meta;
  const filtered = hasTaskFilters(filters);
  const animationKey = `${page}|${search}|${filters.status}|${filters.priority}|${filters.managerId}|${filters.assigneeId}|${filters.dueFrom}|${filters.dueTo}`;

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Create tasks, choose who does the work and who reviews it."
      />

      <TasksToolbar
        filters={filters}
        managers={managers.data ?? []}
        employees={employees.data ?? []}
        refreshing={list.isFetching}
        onChange={changeFilters}
        onClear={() => changeFilters(NO_TASK_FILTERS)}
        onRefresh={() => void list.refetch()}
        onCreate={() => openForm(null)}
      />

      {list.isPending ? (
        <TasksListSkeleton />
      ) : list.isError && !list.data ? (
        <div className={styles.error} role="alert">
          <p>Tasks could not be loaded. {list.error.message}</p>
          <Button variant="tonal" compact onClick={() => void list.refetch()}>
            Try again
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title={filtered ? 'No tasks match these filters' : 'No tasks yet'}
          message={
            filtered
              ? 'Try a different search or clear the filters.'
              : 'Create the first task with New task.'
          }
        />
      ) : (
        <div className={list.isPlaceholderData ? styles.stale : undefined}>
          <TasksList
            tasks={tasks}
            animationKey={animationKey}
            onOpen={openDetail}
            onEdit={openForm}
            onApprove={approve}
            onReject={askReject}
            onDelete={askDelete}
          />
        </div>
      )}

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onChange={setPage}
        />
      )}

      <TaskDrawer open={formOpen} task={editing} onClose={() => setFormOpen(false)} />
      <TaskDetail
        open={taskParam !== null}
        taskId={taskParam ?? lastTaskId}
        onClose={closeDetail}
        onEdit={openForm}
        onApprove={approve}
        onReject={askReject}
        onDelete={askDelete}
      />
      <RejectDialog open={rejectOpen} task={rejecting} onClose={() => setRejectOpen(false)} />
      <DeleteDialog
        open={deleteOpen}
        task={deleting}
        onClose={() => setDeleteOpen(false)}
        onDeleted={(task) => {
          if (task.id === taskParam) closeDetail();
        }}
      />
    </>
  );
}
