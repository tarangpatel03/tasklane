import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiError, ApiErrorDetail } from '@task-app/shared';
import { Request, Response } from 'express';
import { STATUS_CODES } from 'http';
import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

interface ErrorParts {
  statusCode: number;
  message: string;
  details?: ApiErrorDetail[];
}

function isDetails(value: unknown): value is ApiErrorDetail[] {
  return Array.isArray(value);
}

function fromHttpException(exception: HttpException): ErrorParts {
  const body = exception.getResponse();
  const statusCode = exception.getStatus();
  if (typeof body === 'string') {
    return { statusCode, message: body };
  }
  const { message, details } = body as { message?: unknown; details?: unknown };
  return {
    statusCode,
    message: Array.isArray(message) ? message.join(', ') : String(message ?? exception.message),
    details: isDetails(details) ? details : undefined,
  };
}

function fromQueryFailed(exception: QueryFailedError): ErrorParts | null {
  const code = (exception.driverError as { code?: string } | undefined)?.code;
  if (code === PG_UNIQUE_VIOLATION) {
    return { statusCode: HttpStatus.CONFLICT, message: 'Resource already exists' };
  }
  if (code === PG_FOREIGN_KEY_VIOLATION) {
    return { statusCode: HttpStatus.CONFLICT, message: 'Referenced resource does not exist' };
  }
  return null;
}

/** Formats every error as the shared `ApiError` envelope. Internals (stack, SQL) go to the log only. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    let parts: ErrorParts | null = null;
    if (exception instanceof HttpException) {
      parts = fromHttpException(exception);
    } else if (exception instanceof QueryFailedError) {
      parts = fromQueryFailed(exception);
    }

    if (!parts) {
      this.logger.error(
        exception instanceof Error ? exception.message : 'Unknown error',
        exception instanceof Error ? exception.stack : undefined,
      );
      parts = { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
    }

    const body: ApiError = {
      success: false,
      statusCode: parts.statusCode,
      error: STATUS_CODES[parts.statusCode] ?? 'Error',
      message: parts.message,
      ...(parts.details && { details: parts.details }),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };
    response.status(parts.statusCode).json(body);
  }
}
