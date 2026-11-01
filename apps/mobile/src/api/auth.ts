import type { AuthTokens, AuthUser } from '../auth/types';
import { apiRequest } from './client';

export function login(email: string, password: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    body: { email, password },
    public: true,
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}

export function logout(refreshToken: string): Promise<null> {
  return apiRequest<null>('/auth/logout', { method: 'POST', body: { refreshToken } });
}

/** The API answers 200 whether or not the email has an account. */
export function forgotPassword(email: string): Promise<null> {
  return apiRequest<null>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    public: true,
  });
}
