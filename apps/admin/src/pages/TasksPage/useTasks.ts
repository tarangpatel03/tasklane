import { Role, UserStatus, type TaskAction } from '@task-app/shared';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  createComment,
  createTask,
  deleteTask,
  getTask,
  listComments,
  listHistory,
  listTasks,
  transitionTask,
  updateTask,
  type CommentDto,
  type CreateTaskBody,
  type HistoryDto,
  type ListTasksParams,
  type Page,
  type TaskDto,
  type UpdateTaskBody,
} from '../../api/tasks.api';
import { listUsers, type UserDto } from '../../api/users.api';

const TASKS_KEY = ['tasks'] as const;

/** One page of tasks; the previous page stays on screen while the next one loads. */
export function useTasksList(params: ListTasksParams): UseQueryResult<Page<TaskDto>> {
  return useQuery({
    queryKey: [...TASKS_KEY, 'list', params],
    queryFn: () => listTasks(params),
    placeholderData: keepPreviousData,
  });
}

export function useTask(id: string | null): UseQueryResult<TaskDto> {
  return useQuery({
    queryKey: [...TASKS_KEY, 'detail', id],
    queryFn: () => getTask(id ?? ''),
    enabled: id !== null,
  });
}

export function useComments(taskId: string | null): UseQueryResult<Page<CommentDto>> {
  return useQuery({
    queryKey: [...TASKS_KEY, 'comments', taskId],
    queryFn: () => listComments(taskId ?? ''),
    enabled: taskId !== null,
  });
}

export function useHistory(taskId: string | null): UseQueryResult<Page<HistoryDto>> {
  return useQuery({
    queryKey: [...TASKS_KEY, 'history', taskId],
    queryFn: () => listHistory(taskId ?? ''),
    enabled: taskId !== null,
  });
}

/**
 * Managers or Employees for the pickers. The API caps a page at 100; deactivated users are hidden
 * because the API rejects them as assignees or Manager.
 */
export function usePeople(role: Role.MANAGER | Role.EMPLOYEE): UseQueryResult<UserDto[]> {
  return useQuery({
    queryKey: ['users', 'people', role],
    queryFn: async () => {
      const { items } = await listUsers({ page: 1, limit: 100, role });
      return items.filter((user) => user.status !== UserStatus.DEACTIVATED);
    },
    staleTime: 30_000,
  });
}

export function useCreateTask(): UseMutationResult<TaskDto, Error, CreateTaskBody> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask(): UseMutationResult<
  TaskDto,
  Error,
  { id: string; body: UpdateTaskBody }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateTask(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask(): UseMutationResult<null, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useTransitionTask(): UseMutationResult<
  TaskDto,
  Error,
  { id: string; action: TaskAction; comment?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, comment }) => transitionTask(id, action, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useAddComment(taskId: string): UseMutationResult<CommentDto, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createComment(taskId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...TASKS_KEY, 'comments', taskId] }),
  });
}
