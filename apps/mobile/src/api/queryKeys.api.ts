import type { TaskStatus } from '@task-app/shared';
import { createQueryKeys } from '../utils/queryKeyFactory.util';

/** The list filter is a status tab, or null for all tasks. */
const baseTaskKeys = createQueryKeys<TaskStatus | null>('tasks');

/** Single source of truth for React Query keys; never write a key array inline. */
export const taskKeys = {
  ...baseTaskKeys,
  summary: () => [...baseTaskKeys.all, 'summary'] as const,
  comments: (taskId: string) => [...baseTaskKeys.all, 'comments', taskId] as const,
  history: (taskId: string) => [...baseTaskKeys.all, 'history', taskId] as const,
};

const baseUserKeys = createQueryKeys('users');

export const userKeys = {
  ...baseUserKeys,
  employees: () => [...baseUserKeys.all, 'employees'] as const,
};
