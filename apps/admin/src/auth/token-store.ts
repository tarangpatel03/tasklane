const REFRESH_KEY = 'task-admin.refresh-token';

let accessToken: string | null = null;

/** Access token lives in memory only, so a page reload always goes through refresh. */
export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_KEY);
  } catch {
    // Storage can be blocked (private mode); the user simply has to log in again.
    return null;
  }
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  try {
    sessionStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    // See getRefreshToken.
  }
}

export function clearTokens(): void {
  accessToken = null;
  try {
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    // See getRefreshToken.
  }
}
