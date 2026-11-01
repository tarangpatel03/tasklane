import { ApiRequestError } from './client';

/** Turns a failed call into text for the user; `byStatus` overrides the message for given HTTP codes. */
export function toMessage(error: unknown, byStatus: Partial<Record<number, string>> = {}): string {
  if (error instanceof ApiRequestError) {
    return byStatus[error.statusCode] ?? error.message;
  }
  // fetch rejects with a TypeError when the server cannot be reached.
  return "Can't reach the server. Check your connection and try again.";
}
