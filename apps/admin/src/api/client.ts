import type { ApiError, ApiErrorDetail, ApiResponse } from '@task-app/shared';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/token-store';
import type { AuthTokens } from '../auth/types';

const BASE_URL = '/api/v1';

/** A failed API call. `details` carries per-field validation messages when present. */
export class ApiRequestError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip the Bearer header and the refresh-and-retry step (login, refresh). */
  public?: boolean;
}

const sessionExpiredListeners = new Set<() => void>();

/** Called when a refresh fails and the user must log in again. Returns an unsubscribe function. */
export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toError(status: number, body: unknown): ApiRequestError {
  if (isRecord(body) && body.success === false) {
    // The envelope shape is guaranteed by the API's global exception filter.
    const error = body as unknown as ApiError;
    return new ApiRequestError(status, error.message, error.details);
  }
  return new ApiRequestError(status, 'Something went wrong. Please try again.');
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getAccessToken();
  if (!options.public && token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

let refreshing: Promise<boolean> | null = null;

/** One refresh at a time: refresh tokens rotate, so parallel calls would revoke each other. */
function refreshSession(): Promise<boolean> {
  refreshing ??= doRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await send('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      public: true,
    });
    const body = await readJson(response);
    if (!response.ok || !isRecord(body) || body.success !== true) {
      // Only a definite rejection ends the session; a network blip keeps the stored token.
      clearTokens();
      return false;
    }
    // Shape comes from the API's AuthResponseDto.
    const { data } = body as unknown as ApiResponse<AuthTokens>;
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/** Calls the API and returns the full envelope (use `meta` for paginated lists). */
export async function apiEnvelope<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  let response = await send(path, options);

  if (response.status === 401 && !options.public) {
    if (await refreshSession()) {
      response = await send(path, options);
    }
    if (response.status === 401) {
      clearTokens();
      sessionExpiredListeners.forEach((listener) => listener());
    }
  }

  const body = await readJson(response);
  if (!response.ok || !isRecord(body) || body.success !== true) {
    throw toError(response.status, body);
  }
  // Success envelope shape is the shared ApiResponse contract.
  return body as unknown as ApiResponse<T>;
}

/** Calls the API and returns only `data`. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return (await apiEnvelope<T>(path, options)).data;
}
