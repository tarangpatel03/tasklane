import { Role, UserStatus } from '@task-app/shared';
import type { CSSProperties, ReactNode } from 'react';
import type { UserDto } from '../../api/users.api';
import { Avatar } from '../../components/Avatar';
import { BanIcon, EditIcon, MailIcon, UndoIcon } from '../../components/Icons';
import { RowMenu, type RowMenuItem } from '../../components/RowMenu';
import { Skeleton } from '../../components/Skeleton';
import { RoleTag, UserStatusBadge } from '../../components/UserBadges';
import styles from './UsersList.module.css';

export interface UserActions {
  onEdit: (user: UserDto) => void;
  onResendInvite: (user: UserDto) => void;
  onDeactivate: (user: UserDto) => void;
  onReactivate: (user: UserDto) => void;
}

interface UsersListProps extends UserActions {
  users: UserDto[];
  currentUserId: string;
  /** Changes when filters or the page change, so rows play their entrance again. */
  animationKey: string;
}

const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function menuItems(user: UserDto, currentUserId: string, actions: UserActions): RowMenuItem[] {
  const items: RowMenuItem[] = [
    { label: 'Edit', icon: <EditIcon size={20} />, onSelect: () => actions.onEdit(user) },
  ];
  // Admin accounts and your own account are never deactivated from this panel.
  const protectedRow = user.role === Role.ADMIN || user.id === currentUserId;
  if (user.status === UserStatus.INVITED) {
    items.push({
      label: 'Resend invite',
      icon: <MailIcon size={20} />,
      onSelect: () => actions.onResendInvite(user),
    });
  }
  if (!protectedRow && user.status === UserStatus.DEACTIVATED) {
    items.push({
      label: 'Reactivate',
      icon: <UndoIcon size={20} />,
      onSelect: () => actions.onReactivate(user),
    });
  }
  if (!protectedRow && user.status !== UserStatus.DEACTIVATED) {
    items.push({
      label: 'Deactivate',
      icon: <BanIcon size={20} />,
      onSelect: () => actions.onDeactivate(user),
      danger: true,
    });
  }
  return items;
}

/** Table from 1024px, cards below. Both come from the same rows; CSS switches the layout. */
export function UsersList({
  users,
  currentUserId,
  animationKey,
  ...actions
}: UsersListProps): ReactNode {
  return (
    <div className={styles.scroll}>
      <div className={styles.table} role="table" aria-label="Users">
        <div className={styles.head} role="row">
          <span role="columnheader">Name</span>
          <span role="columnheader">Role</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Added</span>
          <span role="columnheader" className="visually-hidden">
            Actions
          </span>
        </div>
        <div className={styles.rows} key={animationKey} role="rowgroup">
          {users.map((user, index) => (
            <div
              key={user.id}
              className={styles.row}
              role="row"
              style={{ '--i': Math.min(index, 7) } as CSSProperties}
            >
              <div className={`${styles.user}`} role="cell">
                <Avatar name={user.name} size={40} />
                <span className={styles.who}>
                  <span className={styles.name}>
                    {user.name}
                    {user.id === currentUserId && <span className={styles.you}>You</span>}
                  </span>
                  <span className={styles.email}>{user.email}</span>
                </span>
              </div>
              <div className={styles.meta}>
                <div role="cell">
                  <RoleTag role={user.role} />
                </div>
                <div role="cell">
                  <UserStatusBadge status={user.status} />
                </div>
                <div role="cell" className={styles.added}>
                  <span className={styles.addedLabel}>Added </span>
                  {dateFormat.format(new Date(user.createdAt))}
                </div>
              </div>
              <div role="cell" className={styles.menu}>
                <RowMenu
                  label={`Actions for ${user.name}`}
                  items={menuItems(user, currentUserId, actions)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Placeholder rows with the same shape as real rows, shown on the first load. */
export function UsersListSkeleton(): ReactNode {
  return (
    <div className={styles.scroll} aria-busy="true" aria-label="Loading users">
      <div className={styles.table}>
        <div className={styles.head} aria-hidden="true">
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
          <span>Added</span>
          <span />
        </div>
        <div className={styles.rows}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles.row}>
              <div className={styles.user}>
                <Skeleton width={40} height={40} circle />
                <span className={styles.who}>
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="75%" height={12} />
                </span>
              </div>
              <div className={styles.meta}>
                <Skeleton width={72} height={28} />
                <Skeleton width={92} height={32} />
                <Skeleton width={84} height={14} />
              </div>
              <div className={styles.menu} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
