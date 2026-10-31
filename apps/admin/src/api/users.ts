import type { ApiMeta, Role, UserStatus } from '@task-app/shared';
import { apiEnvelope, apiRequest } from './client';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface ListUsersParams {
  page: number;
  limit: number;
  role?: Role;
  status?: UserStatus;
  search?: string;
}

export interface UserList {
  items: UserDto[];
  meta: ApiMeta;
}

export interface CreateUserBody {
  name: string;
  email: string;
  role: Role.MANAGER | Role.EMPLOYEE;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: Role.MANAGER | Role.EMPLOYEE;
  status?: UserStatus.ACTIVE | UserStatus.DEACTIVATED;
}

export async function listUsers(params: ListUsersParams): Promise<UserList> {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);

  const { data, meta } = await apiEnvelope<UserDto[]>(`/users?${query.toString()}`);
  return {
    items: data,
    meta: meta ?? { page: params.page, limit: params.limit, total: data.length, totalPages: 1 },
  };
}

export function createUser(body: CreateUserBody): Promise<UserDto> {
  return apiRequest<UserDto>('/users', { method: 'POST', body });
}

export function updateUser(id: string, body: UpdateUserBody): Promise<UserDto> {
  return apiRequest<UserDto>(`/users/${id}`, { method: 'PATCH', body });
}

export function resendInvite(id: string): Promise<null> {
  return apiRequest<null>(`/users/${id}/resend-invite`, { method: 'POST' });
}
