import { UserStatus } from '@task-app/shared';
import { apiRequest } from './client';
import type { UserSummary } from './tasks';

/** An Employee a Manager can assign. */
export type Employee = UserSummary;

interface UserRow extends UserSummary {
  status: UserStatus;
}

/** Employees a Manager may pick, by name. Deactivated ones are left out: the API rejects them as assignees. */
export async function fetchEmployees(): Promise<Employee[]> {
  const rows = await apiRequest<UserRow[]>('/users?role=EMPLOYEE&limit=100');
  return rows
    .filter((row) => row.status !== UserStatus.DEACTIVATED)
    .map(({ id, name, role }) => ({ id, name, role }));
}
