import { UserStatus } from '@task-app/shared';
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  createUser,
  listUsers,
  resendInvite,
  updateUser,
  type CreateUserBody,
  type ListUsersParams,
  type UpdateUserBody,
  type UserDto,
  type UserList,
} from '../../api/users.api';

const USERS_KEY = ['users'] as const;

/** One page of users; the previous page stays on screen while the next one loads. */
export function useUsersList(params: ListUsersParams): UseQueryResult<UserList> {
  return useQuery({
    queryKey: [...USERS_KEY, 'list', params],
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export interface UserCounts {
  active: number;
  invited: number;
  deactivated: number;
  total: number;
}

/** Summary counts from three `limit=1` queries, reading only each response's `meta.total`. */
export function useUserCounts(): UserCounts | null {
  const statuses = [UserStatus.ACTIVE, UserStatus.INVITED, UserStatus.DEACTIVATED];
  return useQueries({
    queries: statuses.map((status) => ({
      queryKey: [...USERS_KEY, 'count', status],
      queryFn: () => listUsers({ page: 1, limit: 1, status }),
    })),
    combine: (results) => {
      const [active, invited, deactivated] = results.map((r) => r.data?.meta.total);
      if (active === undefined || invited === undefined || deactivated === undefined) return null;
      return { active, invited, deactivated, total: active + invited + deactivated };
    },
  });
}

export function useCreateUser(): UseMutationResult<UserDto, Error, CreateUserBody> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser(): UseMutationResult<
  UserDto,
  Error,
  { id: string; body: UpdateUserBody }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useResendInvite(): UseMutationResult<null, Error, string> {
  return useMutation({ mutationFn: resendInvite });
}
