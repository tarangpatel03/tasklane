import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.tasklane.refresh-token';
// The Keychain entry needs a username; the value is not used.
const ACCOUNT = 'refresh-token';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let loaded = false;

/** Reads the stored refresh token once at startup. Call before the first API request. */
export async function loadTokens(): Promise<void> {
  if (loaded) return;
  try {
    const stored = await Keychain.getGenericPassword({ service: SERVICE });
    refreshToken = stored ? stored.password : null;
  } catch {
    // An unreadable Keystore entry means the user simply has to sign in again.
    refreshToken = null;
  }
  loaded = true;
}

/** Access token lives in memory only, so a restart always goes through refresh. */
export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

/** Keeps the refresh token in the Android Keystore; failing to persist must not break the session. */
export async function setTokens(access: string, refresh: string): Promise<void> {
  accessToken = access;
  refreshToken = refresh;
  try {
    await Keychain.setGenericPassword(ACCOUNT, refresh, { service: SERVICE });
  } catch {
    // The session works until the app closes; the next start asks for a login.
  }
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    // Nothing stored or Keystore unavailable; the in-memory state is already cleared.
  }
}
