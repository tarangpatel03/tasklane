import { Role, UserStatus } from '@task-app/shared';
import type { ReactNode } from 'react';
import { BanIcon, CheckIcon, MailIcon } from './icons';
import styles from './user-badges.module.css';

const STATUS: Record<UserStatus, { label: string; className: string; icon: ReactNode }> = {
  [UserStatus.ACTIVE]: { label: 'Active', className: styles.active, icon: <CheckIcon size={16} /> },
  [UserStatus.INVITED]: {
    label: 'Invited',
    className: styles.invited,
    icon: <MailIcon size={16} />,
  },
  [UserStatus.DEACTIVATED]: {
    label: 'Deactivated',
    className: styles.deactivated,
    icon: <BanIcon size={16} />,
  },
};

const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.EMPLOYEE]: 'Employee',
};

/** Account status as colour, icon and text together. */
export function UserStatusBadge({ status }: { status: UserStatus }): ReactNode {
  const { label, className, icon } = STATUS[status];
  return (
    <span className={`${styles.status} ${className}`}>
      {icon}
      {label}
    </span>
  );
}

export function roleLabel(role: Role): string {
  return ROLE_LABEL[role];
}

export function RoleTag({ role }: { role: Role }): ReactNode {
  return (
    <span className={`${styles.role} ${role === Role.EMPLOYEE ? styles.employee : styles.manager}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}
