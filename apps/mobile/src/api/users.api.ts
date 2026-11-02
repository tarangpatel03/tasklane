import { ENDPOINTS, Role, UserStatus } from '@task-app/shared';
import { apiRequest } from './client.api';
import type { UserSummary } from './tasks.api';

/** An Employee a Manager can assign. */
export type Employee = UserSummary;

interface UserRow extends UserSummary {
  status: UserStatus;
}

/** Employees a Manager may pick, by name. Deactivated ones are left out: the API rejects them as assignees. */
export async function fetchEmployees(): Promise<Employee[]> {
  const rows = await apiRequest<UserRow[]>(
    `${ENDPOINTS.users.list}?role=${Role.EMPLOYEE}&limit=100`,
  );
  return rows
    .filter((row) => row.status !== UserStatus.DEACTIVATED)
    .map(({ id, name, role }) => ({ id, name, role }));
}
