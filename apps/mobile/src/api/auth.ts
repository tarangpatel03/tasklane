import { ENDPOINTS } from '@task-app/shared';
import type { AuthTokens, AuthUser } from '../auth/types';
import { setTokens } from '../auth/token-store';
import { apiRequest } from './client';

export function login(email: string, password: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>(ENDPOINTS.auth.login, {
    method: 'POST',
    body: { email, password },
    public: true,
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>(ENDPOINTS.auth.me);
}

export function logout(refreshToken: string): Promise<null> {
  return apiRequest<null>(ENDPOINTS.auth.logout, { method: 'POST', body: { refreshToken } });
}

/** The API answers 200 whether or not the email has an account. */
export function forgotPassword(email: string): Promise<null> {
  return apiRequest<null>(ENDPOINTS.auth.forgotPassword, {
    method: 'POST',
    body: { email },
    public: true,
  });
}

/**
 * Changes the password. The API revokes every session and returns a fresh token pair for this
 * device, which replaces the stored one so the user stays signed in here.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const tokens = await apiRequest<AuthTokens>(ENDPOINTS.auth.changePassword, {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
  await setTokens(tokens.accessToken, tokens.refreshToken);
}
