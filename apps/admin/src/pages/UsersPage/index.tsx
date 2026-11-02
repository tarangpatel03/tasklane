import { UserStatus } from '@task-app/shared';
import { useState, type ReactNode } from 'react';
import type { UserDto } from '../../api/users.api';
import { useAuth } from '../../auth/auth.context';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/toast.context';
import { DeactivateDialog } from './subcomponents/DeactivateDialog';
import { UserDrawer } from './subcomponents/UserDrawer';
import { useResendInvite, useUpdateUser, useUserCounts, useUsersList } from './useUsers';
import { UsersList, UsersListSkeleton } from './subcomponents/UsersList';
import { UsersToolbar, type UserFilters } from './subcomponents/UsersToolbar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import styles from './UsersPage.module.css';

const PAGE_SIZE = 8;
const NO_FILTERS: UserFilters = { search: '', role: '', status: '' };

/** Users screen: filterable list, create and edit drawer, invite resend, deactivate and reactivate. */
export function UsersPage(): ReactNode {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [filters, setFilters] = useState<UserFilters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<UserDto | null>(null);

  const search = useDebouncedValue(filters.search.trim(), 300);
  const list = useUsersList({
    page,
    limit: PAGE_SIZE,
    role: filters.role || undefined,
    status: filters.status || undefined,
    search: search || undefined,
  });
  const counts = useUserCounts();
  const resend = useResendInvite();
  const update = useUpdateUser();

  function changeFilters(next: UserFilters): void {
    setFilters(next);
    setPage(1);
  }

  function openDrawer(user: UserDto | null): void {
    setEditing(user);
    setDrawerOpen(true);
  }

  function resendInvite(user: UserDto): void {
    resend.mutate(user.id, {
      onSuccess: () => toast.show(`Invite resent to ${user.email}.`),
      onError: (error) => toast.show(error.message, 'error'),
    });
  }

  function reactivate(user: UserDto): void {
    update.mutate(
      { id: user.id, body: { status: UserStatus.ACTIVE } },
      {
        onSuccess: () => toast.show(`${user.name} was reactivated.`),
        onError: (error) => toast.show(error.message, 'error'),
      },
    );
  }

  const meta = list.data?.meta;
  const users = list.data?.items ?? [];
  const filtered = search !== '' || filters.role !== '' || filters.status !== '';
  const animationKey = `${page}|${search}|${filters.role}|${filters.status}`;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Managers and Employees who can sign in to the mobile app."
      />

      {counts && (
        <dl className={styles.counts}>
          <div>
            <dt>Total</dt>
            <dd>{counts.total}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>{counts.active}</dd>
          </div>
          <div>
            <dt>Invited</dt>
            <dd>{counts.invited}</dd>
          </div>
          <div>
            <dt>Deactivated</dt>
            <dd>{counts.deactivated}</dd>
          </div>
        </dl>
      )}

      <UsersToolbar
        filters={filters}
        refreshing={list.isFetching}
        onChange={changeFilters}
        onClear={() => changeFilters(NO_FILTERS)}
        onRefresh={() => void list.refetch()}
        onCreate={() => openDrawer(null)}
      />

      {list.isPending ? (
        <UsersListSkeleton />
      ) : list.isError && !list.data ? (
        <div className={styles.error} role="alert">
          <p>Users could not be loaded. {list.error.message}</p>
          <Button variant="tonal" compact onClick={() => void list.refetch()}>
            Try again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title={filtered ? 'No users match these filters' : 'No users yet'}
          message={
            filtered
              ? 'Try a different search or clear the filters.'
              : 'Add the first Manager or Employee with New user.'
          }
        />
      ) : (
        <div className={list.isPlaceholderData ? styles.stale : undefined}>
          <UsersList
            users={users}
            currentUserId={currentUser?.id ?? ''}
            animationKey={animationKey}
            onEdit={openDrawer}
            onResendInvite={resendInvite}
            onDeactivate={(user) => {
              setDeactivating(user);
              setDeactivateOpen(true);
            }}
            onReactivate={reactivate}
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

      <UserDrawer open={drawerOpen} user={editing} onClose={() => setDrawerOpen(false)} />
      <DeactivateDialog
        open={deactivateOpen}
        user={deactivating}
        onClose={() => setDeactivateOpen(false)}
      />
    </>
  );
}
