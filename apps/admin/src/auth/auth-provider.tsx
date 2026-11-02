import { useQueryClient } from '@tanstack/react-query';
import { ENDPOINTS, Role } from '@task-app/shared';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiRequestError, apiRequest, onSessionExpired } from '../api/client';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { clearTokens, getRefreshToken, setTokens } from './token-store';
import type { AuthTokens, AuthUser } from './types';

const ADMIN_ONLY_MESSAGE = 'This panel is for Admins only. Please use the mobile app.';

async function revokeSession(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiRequest<null>(ENDPOINTS.auth.logout, { method: 'POST', body: { refreshToken } });
    } catch {
      // The local session is cleared either way; an expired token is already dead server-side.
    }
  }
  clearTokens();
}

/** Holds the signed-in Admin and restores the session from the stored refresh token on load. */
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const reset = useCallback(() => {
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => onSessionExpired(reset), [reset]);

  useEffect(() => {
    let cancelled = false;

    async function restore(): Promise<void> {
      if (!getRefreshToken()) {
        setStatus('anonymous');
        return;
      }
      try {
        // No access token after a reload: the 401 triggers the refresh inside the client.
        const me = await apiRequest<AuthUser>(ENDPOINTS.auth.me);
        if (cancelled) return;
        if (me.role !== Role.ADMIN) {
          await revokeSession();
          if (!cancelled) reset();
          return;
        }
        setUser(me);
        setStatus('authenticated');
      } catch (error) {
        if (cancelled) return;
        // A network failure keeps the stored token so a retry on reload still works.
        if (error instanceof ApiRequestError) clearTokens();
        reset();
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const result = await apiRequest<AuthTokens>(ENDPOINTS.auth.login, {
      method: 'POST',
      body: { email, password },
      public: true,
    });
    setTokens(result.accessToken, result.refreshToken);
    if (result.user.role !== Role.ADMIN) {
      await revokeSession();
      throw new ApiRequestError(403, ADMIN_ONLY_MESSAGE);
    }
    setUser(result.user);
    setStatus('authenticated');
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
