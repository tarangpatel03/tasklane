/** Returned by list services; the response interceptor maps it to `data` + `meta`. */
export class PaginatedResult<T> {
  constructor(
    readonly items: T[],
    readonly total: number,
    readonly page: number,
    readonly limit: number,
  ) {}
}
