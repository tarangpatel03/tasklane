/** Trims strings before validation; other types are left for the validators to reject. */
export function trim({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/** Emails are stored lowercase, so the unique check and login lookups never depend on case. */
export function normalizeEmail({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}
