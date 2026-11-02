import { API_BASE_PATH } from '@task-app/shared';

/**
 * API base URL. Debug builds use the PC's LAN IP (same Wi-Fi); for `adb reverse tcp:3000 tcp:3000`
 * set the debug value to `http://localhost:3000` instead.
 * Release builds must be given an HTTPS URL; there is deliberately no default.
 */
const DEBUG_API_URL = 'http://10.186.105.165:3000';
const RELEASE_API_URL = '';

function resolveApiUrl(): string {
  if (__DEV__) return DEBUG_API_URL;
  if (!RELEASE_API_URL.startsWith('https://')) {
    throw new Error('Set RELEASE_API_URL (an https:// address) in src/config/app-config.ts');
  }
  return RELEASE_API_URL;
}

export const appConfig = {
  apiBaseUrl: `${resolveApiUrl()}${API_BASE_PATH}`,
};
