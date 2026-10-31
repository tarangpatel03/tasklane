import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ApiResponse } from '@task-app/shared';
import { Observable, map } from 'rxjs';
import { PaginatedResult } from '../types/paginated-result';

/** Wraps every successful response in the shared `{ success: true, data, meta? }` envelope. */
@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, ApiResponse<unknown>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((result: unknown): ApiResponse<unknown> => {
        if (result instanceof PaginatedResult) {
          return {
            success: true,
            data: result.items,
            meta: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          };
        }
        return { success: true, data: result ?? null };
      }),
    );
  }
}
