import type { Role, UserStatus } from '@task-app/shared';

/** The signed-in user as returned by `GET /auth/me`. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

/** Body of `POST /auth/login` and `POST /auth/refresh`. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
