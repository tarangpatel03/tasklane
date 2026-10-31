import { Role } from '@task-app/shared';

/** The caller as seen by controllers and services, loaded fresh from the database on every request. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
