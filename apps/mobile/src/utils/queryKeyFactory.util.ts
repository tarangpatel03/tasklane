export type EntityId = string | number;

export interface QueryKeyFactory<TFilters> {
  /** Matches everything cached for the entity, so it is the key to invalidate after a write. */
  all: readonly [string];
  /** Prefix of every list, whatever its filters. */
  lists: () => readonly [string, 'list'];
  list: (filters: TFilters) => readonly [string, 'list', { filters: TFilters }];
  /** Prefix of every single-record query. */
  details: () => readonly [string, 'detail'];
  detail: (id: EntityId) => readonly [string, 'detail', EntityId];
}

/**
 * Builds the hierarchical query keys of one entity, so a key is spelled once and invalidating
 * `all` or `lists()` reaches every query beneath it. Add entity-specific keys by spreading the result.
 */
export function createQueryKeys<TFilters = undefined>(entity: string): QueryKeyFactory<TFilters> {
  const all = [entity] as const;

  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (filters) => [...all, 'list', { filters }] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id) => [...all, 'detail', id] as const,
  };
}
