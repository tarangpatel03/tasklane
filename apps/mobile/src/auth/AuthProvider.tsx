import { useQueryClient } from '@tanstack/react-query';
import { Role } from '@task-app/shared';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../api/auth.api';
import { ApiRequestError, onSessionExpired } from '../api/client.api';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth.context';
import { clearTokens, getRefreshToken, setTokens } from './token.store';
import type { AuthUser } from './auth.types';

const ADMIN_NOT_ALLOWED_MESSAGE = 'Admin accounts sign in on the admin panel.';

async function revokeSession(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await logoutRequest(refreshToken);
    } catch {
      // The local session is cleared either way; an expired token is already dead server-side.
    }
  }
  await clearTokens();
}

/** Holds the signed-in user and restores the session from the stored refresh token on start. */
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const reset = useCallback(() => {
    setUser(null);
    setStatus('signedOut');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => onSessionExpired(reset), [reset]);

  useEffect(() => {
    let cancelled = false;

    async function restore(): Promise<void> {
      if (!getRefreshToken()) {
        setStatus('signedOut');
        return;
      }
      try {
        // No access token after a restart: the 401 triggers the refresh inside the client.
        const me = await fetchMe();
        if (cancelled) return;
        if (me.role === Role.ADMIN) {
          await revokeSession();
          if (!cancelled) reset();
          return;
        }
        setUser(me);
        setStatus('signedIn');
      } catch (error) {
        if (cancelled) return;
        // A network failure keeps the stored token so the next start can still restore the session.
        if (error instanceof ApiRequestError) await clearTokens();
        reset();
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const result = await loginRequest(email, password);
    await setTokens(result.accessToken, result.refreshToken);
    if (result.user.role === Role.ADMIN) {
      await revokeSession();
      throw new ApiRequestError(403, ADMIN_NOT_ALLOWED_MESSAGE);
    }
    setUser(result.user);
    setStatus('signedIn');
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await revokeSession();
    reset();
  }, [reset]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
